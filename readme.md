# darklyrics

> crawls an album's page and compiles a list of most used words

## installation

```
npm install darklyrics -g
```

## usage

> requires [node](https://nodejs.org/) >= 7.6

### example 1

#### input

```
darklyrics --band "Twilight Force" --album "Heroes of Mighty Magic"
```

#### output

```
Looking up http://www.darklyrics.com/lyrics/twilightforce/heroesofmightymagic.html
Twilight Force - Heroes of Mighty Magic: 367.272ms

rank  word      count  related
----  --------  -----  --------------
1     might     37     mighty (18)
2     over      37
3     time      31
4     ride      29     rider (8)
5     sky       29
6     far       26
7     magic     25
8     light     24
9     power     24
10    through   24
11    again     22
12    dragon    22
13    rise      22
14    twilight  21
15    fly       20
16    star      20     starlight (10)
17    kingdom   18     king (11)
18    mighty    18     might (37)
19    hero      17
20    wind      16
```

### example 2

#### input

```
darklyrics --band "Dragonforce"
```

#### output

```
Looking up http://www.darklyrics.com/d/dragonforce.html
Dragonforce: 478.856ms
Looking up http://www.darklyrics.com/lyrics/dragonforce/valleyofthedamned.html
Looking up http://www.darklyrics.com/lyrics/dragonforce/sonicfirestorm.html
Looking up http://www.darklyrics.com/lyrics/dragonforce/inhumanrampage.html
Looking up http://www.darklyrics.com/lyrics/dragonforce/ultrabeatdown.html
Looking up http://www.darklyrics.com/lyrics/dragonforce/thepowerwithin.html
Looking up http://www.darklyrics.com/lyrics/dragonforce/maximumoverload.html
Dragonforce - Sonic Firestorm: 480.682ms
Dragonforce - Valley Of The Damned: 498.801ms
Dragonforce - Maximum Overload: 525.033ms
Dragonforce - Ultra Beatdown: 556.190ms
Dragonforce - The Power Within: 587.011ms
Dragonforce - Inhuman Rampage: 612.489ms

rank  word     count  related
----  -------  -----  ---------------------------
1     all      243
2     through  171
3     time     165
4     now      153    nowhere (5)
5     life     145    lifetime (23)
6     one      118
7     fire     114
8     stand    107    standing (28), standard (3)
9     forever  102    forevermore (3)
10    night    102    nightmare (5)
11    day      95     daylight (9)
12    sky      95
13    still    95
14    again    89
15    fight    89     fighting (19)
16    pain     89
17    land     87
18    heart    83     hear (23)
19    inside   82
20    tonight  81
```

## license

MIT
