import json
import os
import socket
import time

root = {}
d3_graph = {}
max_pidx = 99999
recv_filecnt = 0

def add_to_graph(path, match_count):    
    curr = root
    
    for i in range(0, len(path) - 2):
        dir = path[i]
        if not dir in curr:
            curr[dir] = {}
        curr = curr[dir]
        
    curr[path[len(path) - 1]] = int(match_count)

def parse_msg(msg):
    global recv_filecnt
    global max_pidx
    if str(msg[:3]) == 'EOF':
        recv_filecnt = recv_filecnt + 1
    elif str(msg[:6]) == 'MAXPID':
        max_pidx = int(msg[6:])
    else:
        [filename, match_count, ] = msg.split(":::")
        print(f'{filename} : {match_count}')
        
        path = filename.split("/")
        add_to_graph(path, match_count)


def make_graph(dir, name, depth):
    if isinstance(dir, int):
        elem = {'id' : name, 'val' : dir, 'depth' : 0}
        d3_graph['nodes'].append(elem)
        return dir

    sum = 0
    for key in dir:
        elem = {'source' : name, 'target' : name + '/' + key }
        d3_graph['links'].append(elem)
        # make link
        sum += make_graph(dir[key], name + '/' + key, depth + 1)

    # elem = {'id' : name, 'val' : sum, 'depth' : depth}
    elem = {'id' : name, 'val' : 1, 'depth' : depth}
    d3_graph['nodes'].append(elem)
    
    return sum


if __name__ == '__main__':
    # Bind socket
    server_addr = "../uds"
    sock = socket.socket(family=socket.AF_UNIX, type=socket.SOCK_DGRAM)
    if os.path.exists(server_addr):
        os.unlink(server_addr)
    sock.bind(server_addr)

    msgcnt = 0
    
    msg, addr, = sock.recvfrom(1500)
    t0 = time.time()
    # Recv msg
    while (True) :
        msgcnt += 1
        # print(f'{msg.decode()} from {addr}')
        
        parse_msg(msg.decode())
        
        if max_pidx <= recv_filecnt:
            break
        else:
            print(f'{recv_filecnt}/{max_pidx} msgcnt : {msgcnt}')
        msg, addr, = sock.recvfrom(1500)
    
    
    sock.close()
    f = open("Result.json", "w")
    f.write(json.dumps(root, indent = 4))
    f.close()
    
    d3_graph['nodes'] = []
    d3_graph['links'] = []
    
    
    # for e in root['..']['linux-5.15.63']:
    #     make_graph(root['..']['linux-5.15.63'][e], e, 1)
        
    make_graph(root['..']['linux-5.15.63'], "linux", 1)
    f = open("d3-data.json", "w")
    f.write(json.dumps(d3_graph, indent = 4))
    f.close()

    t1 = time.time()
    total = t1-t0
    print(f'{total}')