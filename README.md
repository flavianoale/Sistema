# ASCENSÃO OS (PWA offline-first)

App em **HTML/CSS/JS puro**, sem backend, sem login e com persistência local (`localStorage` + `IndexedDB` para logs).

## Recursos principais
- Boot screen imersiva estilo terminal com barra de progresso e áudio sintético (WebAudio).
- Hub **AGORA** com missão por janela de horário, conclusão rápida e pulo com penalidade + confirmação em 2 toques.
- Abas: AGORA, ROTINA, TREINO, DIETA, ESTUDOS, ESPIRITUALIDADE, SOCIAL, OPERACIONAL, FINANÇAS, RELATÓRIOS, CONFIG.
- Gamificação: XP, nível, rank, integridade, streak, débitos e bônus.
- Dieta com metas automáticas (kcal/macros), opções por refeição com gramas/macros, aderência diária e log rápido.
- Treino casa/academia com split, log mínimo obrigatório (reps/carga), tarefas semanais (posing/tanning).
- Estudos com rotação de matérias, aula vs estudo ativo e registro de minutos + 3 pontos.
- Espiritualidade católica (oração, Bíblia, terço, missa) com progresso.
- Finanças com registro de gastos/receitas e exportação CSV.
- Relatórios diários exportáveis em TXT/JSON.
- Service Worker cache-first + `manifest.json` para instalação PWA.

## Estrutura
- `index.html`
- `styles.css`
- `app.js`
- `sw.js`
- `manifest.json`
- `icons/icon.svg`

## Rodar localmente
1. Abra `index.html` direto no navegador **ou** rode servidor estático:
   - `python -m http.server 8080`
2. Acesse `http://localhost:8080`.

## Deploy no GitHub Pages
1. Suba o projeto para um repositório no GitHub.
2. Vá em **Settings → Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**.
4. Escolha branch (`main`) e pasta `/ (root)`.
5. Salve e aguarde o link público.

## Deploy no Cloudflare Pages
1. Crie um repositório GitHub com estes arquivos.
2. No Cloudflare: **Workers & Pages → Create application → Pages → Connect to Git**.
3. Selecione o repositório.
4. Build settings:
   - Framework preset: `None`
   - Build command: *(vazio)*
   - Build output directory: `/`
5. Deploy.

## Instalar como PWA
### Android (Chrome/Edge)
1. Abra a URL publicada.
2. Menu do navegador → **Instalar app** / **Adicionar à tela inicial**.

### iPhone (Safari)
1. Abra a URL publicada no Safari.
2. Toque em **Compartilhar**.
3. Selecione **Adicionar à Tela de Início**.
4. Confirme nome e toque em **Adicionar**.

### Desktop (Chrome/Edge)
1. Abra a URL publicada.
2. Clique no ícone de instalação na barra de endereço.

## Limpar cache / atualizar Service Worker
1. Abra DevTools → Application.
2. Em **Service Workers**, clique em **Unregister**.
3. Em **Storage**, clique em **Clear site data**.
4. Recarregue a página com `Ctrl+Shift+R`.

## Aviso de segurança/saúde
Este app oferece organização, adesão e hábitos. **Não substitui** avaliação de médico, nutricionista, fisioterapeuta, psicólogo, endocrinologista ou dermatologista. Procure profissional em caso de dor persistente, sintomas relevantes, sofrimento mental ou alterações clínicas.
