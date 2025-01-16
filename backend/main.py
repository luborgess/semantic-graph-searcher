from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import requests
from bs4 import BeautifulSoup
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()

class Neo4jConnection:
    def __init__(self):
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USER", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def create_search_graph(self, search_term: str, nodes: List[Dict], relationships: List[Dict]):
        with self.driver.session() as session:
            session.execute_write(self._create_graph, search_term, nodes, relationships)

    @staticmethod
    def _create_graph(tx, search_term: str, nodes: List[Dict], relationships: List[Dict]):
        # Clear previous results for this search term
        tx.run("MATCH (n:SearchTerm {term: $term})-[r]-() DELETE n, r", term=search_term)
        
        # Create search term node
        tx.run("CREATE (n:SearchTerm {term: $term})", term=search_term)
        
        # Create nodes and relationships
        for node in nodes:
            tx.run("""
                MATCH (s:SearchTerm {term: $search_term})
                CREATE (n:Keyword {name: $name, group: $group})
                CREATE (s)-[:CONTAINS]->(n)
            """, search_term=search_term, name=node["name"], group=node["group"])
        
        for rel in relationships:
            tx.run("""
                MATCH (a:Keyword {name: $source})
                MATCH (b:Keyword {name: $target})
                CREATE (a)-[:RELATED {weight: $weight}]->(b)
            """, source=rel["source"], target=rel["target"], weight=rel["weight"])

def scrape_duckduckgo(query: str, max_results: int = 20) -> List[str]:
    url = f"https://html.duckduckgo.com/html/?q={query}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        results = []
        for result in soup.select('.result__body')[:max_results]:
            title = result.select_one('.result__title')
            snippet = result.select_one('.result__snippet')
            if title and snippet:
                results.append({
                    'title': title.get_text(strip=True),
                    'snippet': snippet.get_text(strip=True)
                })
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping results: {str(e)}")

def extract_keywords(text: str) -> List[str]:
    # Tokenize and remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = word_tokenize(text.lower())
    keywords = [word for word in tokens if word.isalnum() and word not in stop_words]
    
    # Get frequency distribution
    freq_dist = nltk.FreqDist(keywords)
    return [word for word, freq in freq_dist.most_common(10)]

@app.get("/api/search/{query}")
async def search(query: str):
    try:
        # Scrape search results
        results = scrape_duckduckgo(query)
        
        # Extract keywords and build graph
        nodes = []
        relationships = []
        seen_keywords = set()
        
        # Add search query as central node
        nodes.append({
            "id": "1",
            "name": query,
            "val": 2,
            "color": "#ff6b6b",
            "group": 1
        })
        seen_keywords.add(query.lower())
        
        # Process each search result
        for idx, result in enumerate(results):
            # Extract keywords from title and snippet
            text = f"{result['title']} {result['snippet']}"
            keywords = extract_keywords(text)
            
            # Add new keywords as nodes
            for kw_idx, keyword in enumerate(keywords):
                if keyword.lower() not in seen_keywords:
                    node_id = str(len(nodes) + 1)
                    nodes.append({
                        "id": node_id,
                        "name": keyword,
                        "val": 1,
                        "color": "#4ecdc4",
                        "group": 2
                    })
                    seen_keywords.add(keyword.lower())
                    
                    # Create relationship with search term
                    relationships.append({
                        "source": "1",
                        "target": node_id,
                        "value": 1
                    })
        
        # Store in Neo4j
        neo4j_conn = Neo4jConnection()
        neo4j_conn.create_search_graph(query, nodes, relationships)
        neo4j_conn.close()
        
        return {
            "nodes": nodes,
            "links": relationships
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)