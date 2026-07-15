# Firma segura para Bold

## Despliegue actual en Raspberry Pi

El servicio se publica en `https://bold.sierradoradagastrobar.com` mediante Cloudflare Tunnel y escucha localmente en `127.0.0.1:3102`.

La llave secreta se almacena como una credencial cifrada de `systemd` en `/etc/credstore.encrypted/sierra-dorada-bold-secret.cred`. El servicio la recibe mediante `LoadCredentialEncrypted`; no se utiliza un archivo de entorno plano.

```bash
sudo systemd-creds encrypt --name=BOLD_SECRET_KEY - /etc/credstore.encrypted/sierra-dorada-bold-secret.cred
sudo systemctl restart bold-signature.service
```

Luego verifica que `https://bold.sierradoradagastrobar.com/health` responda con `configured: true`.

## Alternativa Cloudflare Worker

Este Worker genera la firma SHA-256 requerida por el botón de pagos Bold sin exponer la llave secreta en GitHub Pages.

1. Copia `wrangler.toml.example` como `wrangler.toml`.
2. Desde esta carpeta ejecuta `npx wrangler secret put BOLD_SECRET_KEY` y pega la llave secreta de pruebas cuando Wrangler la solicite.
3. Despliega con `npx wrangler deploy`.
4. Copia la URL resultante y agrégala con la ruta `/bold/signature` en `src/js/config/bold.js`, propiedad `signatureEndpoint`.

No escribas la llave secreta en ningún archivo del repositorio.
