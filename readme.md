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

rank  word     count
----  -------  -----
1     over     37
2     might    37
3     time     29
4     ride     28
5     far      26
6     magic    25
7     through  24
8     light    24
9     power    23
10    rise     22
11    again    22
12    fly      20
13    skies    18
14    mighty   18
15    dragon   16
16    hope     15
17    glory    15
18    seas     13
19    bright   13
20    away     13

Twilight Force - Heroes of Mighty Magic: 336.341ms
```

## license

MIT
