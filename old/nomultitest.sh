oldd=$(date)

find ../linux-5.15.63 -name "*.c" > pp&

target="struct\stimespec"

while read p; do
    var=$(grep $target $p | wc -l);
    if  [ $var != "0" ] 
    then
        echo "$p:::$var"
    fi
done <pp

echo $oldd
date