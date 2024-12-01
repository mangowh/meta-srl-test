# MetaSrlTest

Il progetto è basato su Angular 19 configurato con SSR, e utilizza solo Tailwind come framework CSS.

E' possibile lanciare il server di sviluppo tramite `npm run start` e compilare il progetto con `npm run build`. Per hostare il servizio in modalità SSR lanciare `npm run serve:ssr:meta-srl-test`

E' prevista una compatibilità con `@angular/localize`: per compilare le versioni prerenderizzate e localizzate dell'applicativo eseguire `npm run build:localize`

E' stato impostato un sistema di cache per evitare di superare il rate-limit dell'API SWAPI, che è possibile disabilitare tramite la variabile d'ambiente `cacheResources`

N.B. Gli API dell'origin http://lab.gruppometa.it non hanno gli headers CORS necessari per qualsiasi altro dominio oltre che localhost:4200, quindi certe funzionalità saranno solo disponibili in modalità sviluppo
