# darklyrics

> crawls an album's page and compiles a list of most used words

## installation

```
npm install darklyrics -g
```

## usage

> requires [node](https://nodejs.org/) >= 7.6

### input

```
darklyrics --band "Twilight Force" --album "Heroes of Mighty Magic"
```

### output

```
Looking up http://www.darklyrics.com/lyrics/twilightforce/heroesofmightymagic.html

rank  word      count  related
----  --------  -----  -----------
1     might     40     mighty (18)
2     over      37
3     time      29
4     ride      28     riders (8)
5     far       26
6     magic     25
7     through   24
8     light     24
9     again     23
10    power     23
11    rise      22
12    twilight  21
13    fly       20
14    skies     18
15    mighty    18     might (40)
16    glory     16
17    dragon    16     dragons (6)
18    hope      15
19    stars     14     star (8)
20    bright    13

Twilight Force - Heroes of Mighty Magic: 336.284ms
```

## license

MIT
