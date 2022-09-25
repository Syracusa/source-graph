# TODO : Debug this shit


# Kernel keyword search script
## $1 : target word 

python3 parser.py&

target=$1
pmaxdepth=2

mkdir -p ../temp/
rm ../temp/*
cd ../temp/

# Call python script that read file and send search result to parser
## $1 : filename
callread() {
    echo 'callread '$1
    python3 ../source-graph/readsend.py $1
}

npidx=0


# Search keyword at given file
## $1 file list recv fifo
## $2 write file name
do_infile_search() {
    touch $2

    while read p; do
        var=$(grep $target $p | wc -l);
        if  [ $var != "0" ] 
        then
            echo "$p:::$var" >>$2;
        fi
    done <$1

    callread $2

    unlink $1
}

# Search keyword at given directory 
# $1 : Directory to search
# $2 : pipe name to send&recv file
# $3 : Depth
do_search() {

    if [ pmaxdepth == $3 ]
    then
        find $1 -regex '.*/.*\.\(c\|h\)$' >$2&

        do_infile_search $2 $2".txt"
    else
        # Local search

        lpname='lp'$npidx
        mkfifo $lpname
        find $1 -mindepth 1 -maxdepth 1 -regex '.*/.*\.\(c\|h\)$' >$lpname&

        do_infile_search $lpname $lpname".txt"

        # Recursive
        dpname="dp"$npidx
        mkfifo $dpname
        find $1 -mindepth 1 -maxdepth 1 -type d >$dpname

        while read p; do
            npidx=$(($npidx + 1))

            pname='p'$npidx
            mkfifo $pname

            do_search $p $pname $(($3 + 1))&
        done <$dpname

        unlink $dpname
    fi
}

mkfifo 'rootp'
do_search '../linux-5.15.63' 'rootp' 0

python3 ../source-graph/readsend.py MAXPID $npidx