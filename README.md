# ASCENSÃO OS (PWA Offline-First)

App único de rotina + treino + dieta + estudos + espiritualidade + social + operacional + finanças + relatórios.

## Stack
- HTML/CSS/JS puro (sem frameworks)
- Service Worker cache-first
- LocalStorage (estado/config) + IndexedDB (logs de eventos)
- PWA instalável (Android/iPhone/desktop)

## Estrutura
- `index.html` interface principal com boot, tabs e modal.
- `styles.css` tema retro terminal/Atari.
- `app.js` toda lógica (gamificação, módulos, persistência, relatórios, config).
- `sw.js` cache offline.
- `manifest.json` metadados PWA.
- `icons/` ícones.

## Rodar localmente
1. Abra terminal na pasta.
2. Execute servidor estático:
   - `python3 -m http.server 8080`
3. Acesse `http://localhost:8080`.

## Deploy no Cloudflare Pages
1. Crie repositório GitHub com estes arquivos.
2. No Cloudflare Dashboard: **Workers & Pages** → **Create application** → **Pages**.
3. **Connect to Git** e selecione o repo.
4. Build settings:
   - Framework preset: `None`
   - Build command: *(vazio)*
   - Build output directory: `/`
5. Deploy.
6. Abra a URL gerada e valide modo offline (desligue rede depois de abrir uma vez).

## Deploy no GitHub Pages
1. Suba o projeto para GitHub.
2. Em **Settings** do repo → **Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**.
4. Branch: `main` (ou atual), pasta `/root`.
5. Salve e aguarde publicação.
6. URL final: `https://SEU_USUARIO.github.io/SEU_REPO/`.

## Instalar como PWA
### Android (Chrome)
1. Abra a URL do app.
2. Menu `⋮` → **Instalar app**.
3. Confirmar.

### iPhone (Safari)
1. Abra a URL no Safari.
2. Compartilhar → **Adicionar à Tela de Início**.
3. Confirmar nome/ícone.

### Desktop (Chrome/Edge)
1. Abra o app.
2. Clique no ícone de instalação na barra de endereço.
3. Instale.

## Reset de cache/service worker
Quando fizer update e quiser limpar versão antiga:
1. Abra DevTools → **Application**.
2. Em **Service Workers**, clique **Unregister**.
3. Em **Storage**, clique **Clear site data**.
4. Recarregue com `Ctrl+Shift+R` (ou limpar dados no celular em configurações do navegador).

## Segurança e limites
- O app **não substitui** médico, endocrinologista, fisioterapeuta, nutricionista ou psicólogo.
- Em dor persistente, sintomas graves, lesão ou sofrimento mental intenso: procurar profissional.

## Backup / Restore
- Em `CONFIG`: exportar/importar JSON de configuração.
- Em `RELATÓRIOS`: exportar relatório TXT e snapshot JSON do estado.
