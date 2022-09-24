python3 parser.py&

target="struct\stimespec"
# target="struct"

rm ../testdir/*

cd ../testdir/


callread() {
    python3 ../scripts/readsend.py $1    
}

export -f callread

testfunc() {
    touch $2".txt"
    # echo "in testfunc "$1"   "$2
    find $1 -name "*.c" > $2&

    while read p; do
        var=$(grep $target $p | wc -l);
        if  [ $var != "0" ] 
        then
            echo "$p:::$var" >>$2".txt";
        fi
    done <$2

    find $1 -name "*.h" > $2&
    while read p; do
        var=$(grep $target $p | wc -l);
        if  [ $var != "0" ] 
        then
            echo "$p:::$var" >>$2".txt";
        fi
    done <$2

    unlink $2

    callread $2".txt"
}

export -f testfunc

# Depth 1
./d1.sh $target&

# Depth > 1
mkfifo pp;
find ../linux-5.15.63 -mindepth 2 -maxdepth 2 -type d > pp&

var=0; 
while read p; do
    fifoname="p"$var;
    mkfifo $fifoname;

    var=$((var+1));
    # sem "testfunc $p $fifoname"
    testfunc $p $fifoname&
    sleep 0.02
done <pp;

unlink pp;

python3 ../scripts/readsend.py MAXPID $var
