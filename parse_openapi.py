import json

with open("openapi.json", "r") as f:
    data = json.load(f)

for path, methods in data["paths"].items():
    for method, info in methods.items():
        if method == "parameters":
            continue
        print(f"[{method.upper()}] {path}")
        print(f"  Summary: {info.get('summary', 'N/A')}")
        
        # Check security
        security = info.get("security", [])
        if security:
            print(f"  Security: {security}")
        
        # Check request body
        if "requestBody" in info:
            content = info["requestBody"].get("content", {})
            if "application/json" in content:
                schema = content["application/json"].get("schema", {})
                if "$ref" in schema:
                    print(f"  Request Body Ref: {schema['$ref']}")
        
        print()
