from pathlib import Path
import json

# Parse file and make dict

KEYWORD = 'struct timespec'

def add_to_graph(g: dict, path : str, num: int):
    li = path.split('/')
    fname = path
    
    curr = g
    dname = ''
    for idx in range(5, len(li) - 1):

        dname += '/' + li[idx]
        if not dname in curr:
            curr[dname] = { '__name' : dname }
        curr = curr[dname]

    curr[fname] = num

def kwdcount_file(kwd : str, p : str):
    c = 0
    with open(p) as file:
        for line in file:
            oc = line.count(kwd)
            c += oc
    return c

def get_graph(root : str):
    graph = { '__name' : 'root' }
    
    for path in Path(root).rglob('*.c'):
        ppath = path.as_posix()
        c = kwdcount_file(KEYWORD, ppath)
        if c > 10:
            print(f'{c} : {ppath}')
            add_to_graph(graph, ppath, c)

    print(graph)
    
    return graph

# Make to d3 json
def d3_add_node(d3_links : list, node : str, val : int): 
    elem = {'id' : node, 'val' : val}
    d3_links.append(elem)

def d3_add_link(d3_nodes : list, node1 : str, node2 : str):
    elem = {'source' : node1, 'target' : node2}
    d3_nodes.append(elem)

def make_d3_json(g: dict):
    d3_graph = { 'nodes' : [], 'links' : [] }
    d3_add_node(d3_graph['nodes'], 'root', 1)

    # DFS traversal
    stack = [g]
    
    while len(stack) != 0:
        e = stack.pop()
        for k, v in e.items():
            if k == '__name':
                continue

            print(f'{k}:{v}')
            if isinstance(v, int):
                d3_add_node(d3_graph['nodes'], k, v)
                d3_add_link(d3_graph['links'], k, e['__name'])
            else:
                d3_add_node(d3_graph['nodes'], k, 1)
                d3_add_link(d3_graph['links'], k, e['__name'])
                stack.append(v)

    f = open("d3-data.json", "w")
    f.write(json.dumps(d3_graph, indent = 4))
    f.close()



if __name__ == '__main__':
    g = get_graph('/home/kj/dev/linux')
    make_d3_json(g)