def build_graph(nodes, edges):

    graph = {}

    for node in nodes:
        graph[node["id"]] = []

    for edge in edges:
        graph[edge["source"]].append(
            edge["target"]
        )

    return graph