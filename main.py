from pathlib import Path
import json

# Parse file and make dict

def is_leafnode(d: dict):
    if 'file' in d:
        return True
    return False

def add_to_graph(g: dict, path : str, num: int):
    li = path.split('/')
    
    fname = li[len(li) - 1]
    
    curr = g
    for idx in range(5, len(li) - 1):
        dname = li[idx]
        if not dname in curr:
            curr[dname] = {}
        curr = curr[dname]
    curr['file'] = fname
    curr['count'] = num

def kwdcount_file(kwd : str, p : str):
    c = 0
    with open(p) as file:
        for line in file:
            oc = line.count(kwd)
            c += oc
    return c

def get_graph(root : str):
    graph = {}
    
    for path in Path(root).rglob('*.c'):
        ppath = path.as_posix()
        c = kwdcount_file('struct timespec', ppath)
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

    # DFS traversal
    stack = [g]
    
    while len(stack) != 0:
        e = stack.pop()
        if not isinstance(e, dict):
            print(f'err e is not dict {e} {e.type()}')
            continue
        else:
            for k, v in e.items():
                print(f'{k}:{v}')
                if is_leafnode(v):
                    d3_add_node(d3_graph['nodes'], v['file'], v['count'])
                    d3_add_link(d3_graph['links'], k, v['file'])
                else:
                    d3_add_node(d3_graph['nodes'], k, 1)
                    d3_add_link(d3_graph['links'], k, ck)
                    stack.append(v)
    f = open("d3-data.json", "w")
    f.write(json.dumps(d3_graph, indent = 4))
    f.close()



if __name__ == '__main__':
    g = get_graph('/home/kj/dev/linux')
    make_d3_json(g)