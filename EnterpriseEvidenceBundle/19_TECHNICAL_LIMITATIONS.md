# Technical Limitations

* LocalVectorDatabase non persiste su disco i vettori. I dati vanno persi al riavvio del server Express.
* Nessun sistema multi-tenant, single user app.
* Express Rate Limiter non configura correttamente IPV6 `keyGenerator`.
* `VaultService` salva le chiavi in chiaro nella RAM (JS Map). Nessun Key Management System.
* QA Scanner simula vulnerabilità cablate (`QualityAssuranceEngine.ts`).
