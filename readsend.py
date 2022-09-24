import socket
import sys
import os.path

print('Argument :', sys.argv[1])

server_addr = "../uds"
sock = socket.socket(family=socket.AF_UNIX, type=socket.SOCK_DGRAM)
sock.settimeout(None)

# Check if file exist and send msg line by line
if os.path.isfile(sys.argv[1]):
    f = open(sys.argv[1], "r")
    for line in f:
        sock.sendto(str.encode(line), server_addr)
    f.close()
    sock.sendto(str.encode("EOF"), server_addr)
else:
    # No file or CTRL msg
    if str(sys.argv[1]) == 'MAXPID':
        sock.sendto(str.encode(f"MAXPID{sys.argv[2]}"), server_addr)
        
sock.close()