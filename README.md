# Hol-a-vonat

<p align="center">
  <img src="https://i.imgur.com/WWeBROl.gif" height="300px" alt="xD"/>
  <img src="https://i.imgur.com/nquEV1l.png" height="300px" alt="xD"/>
</p>

## Ez a weboldal ennyi. Tényleg.

## Használat

Ha futtatni akarod saját szerveren, akkor:

1. **index.html**-ben írd át a domaint (`<meta content=...>`, meg ilyesmi), hogy ne az én szerveremhez menjen, hanem a tiédhez.
2. Futtasd az `updater` nevű genyót cronnal (vagy mással, tökmindegy), hogy frissítse a train_data fájlt.
   - A scriptben cseréld ki, hogy **hova rakja azt a szar fájlt**, különben nem fog működni a frontend.
3. Ennyi. Csá.

## Függőségek

- frontend: csak HTML+JS, nem kell semmi extra
- backend updater: kell hozzá valami Python meg cron, attól függ, mit csináltál belőle  
  (ha nem tudod, akkor lehet nem neked való ez az egész)

## License

Valószínűleg MIT vagy valami ilyesmi.  
Használd nyugodtan, csak ne kérdezd meg, miért nem megy.
