cd ../testdir/

# Depth 1
mkfifo d1;

find ../linux-5.15.63 -name "*.c" -mindepth 2 -maxdepth 2 > d1&
touch "d1.txt"

while read p; do
    var=$(grep $1 $p | wc -l);
    if  [ $var != "0" ] 
    then
        echo "$p:::$var" >>"d1.txt"
    fi
done <d1

find ../linux-5.15.63 -name "*.h" -mindepth 2 -maxdepth 2 > d1&
while read p; do
    var=$(grep $1 $p | wc -l);
    if  [ $var != "0" ] 
    then
        echo "$p:::$var" >>"d1.txt"
    fi
done <d1

callread "d1.txt"