from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_backend():
    print("🧪 Testing VoltKey FastAPI Backend...")
    
    # Test 1: Health Endpoint
    res = client.get("/health")
    print("1. GET /health ->", res.status_code, res.json())
    assert res.status_code == 200

    # Test 2: Chat Completions Endpoint
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "user", "content": "Hello VoltKey!"}
        ]
    }
    res_chat = client.post("/v1/chat/completions", json=payload)
    print("2. POST /v1/chat/completions ->", res_chat.status_code)
    print("Response Body:\n", res_chat.json())
    assert res_chat.status_code == 200
    print("✅ All backend verification tests passed!")

if __name__ == "__main__":
    test_backend()
