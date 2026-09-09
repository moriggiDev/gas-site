# São Francisco Gás — Site + Painel Admin

## O que tem aqui
- `pages/index.js` — site público (preços, área de entrega, botão de WhatsApp)
- `pages/admin.js` — painel protegido por senha pra editar preços e entrega
- `pages/api/data.js` — API que guarda e lê os dados
- Banco de dados: Vercel KV / Upstash Redis (grátis no plano Hobby)

## Passo a passo pra colocar no ar

### 1. Subir pro GitHub
1. Crie um repositório novo no GitHub (ex: `sao-francisco-gas`)
2. Suba esta pasta pra ele (pelo site do GitHub em "uploading an existing file", ou por linha de comando: `git init`, `git add .`, `git commit -m "site inicial"`, `git remote add origin SEU_LINK`, `git push -u origin main`)

### 2. Importar na Vercel
1. Entre em vercel.com com sua conta (pode logar direto com GitHub)
2. Clique em "Add New" → "Project"
3. Selecione o repositório que você acabou de subir
4. Clique em "Deploy" (pode deployar mesmo sem banco ainda, ele mostra os preços padrão)

### 3. Criar o banco de dados
1. Dentro do projeto na Vercel, vá na aba "Storage"
2. Clique em "Create Database" → escolha "Redis" (via Upstash, é o que substituiu o antigo "Vercel KV")
3. Depois de criado, clique em "Connect" e conecte ao seu projeto
4. Isso preenche as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN` automaticamente

### 4. Definir a senha do admin
1. Vá em "Settings" → "Environment Variables"
2. Adicione: `ADMIN_PASSWORD` = (escolha uma senha forte, só você e seu patrão vão saber)
3. Salve

### 5. Redeploy
1. Volte na aba "Deployments"
2. Clique nos três pontinhos do último deploy → "Redeploy"
   (necessário pra ele pegar as variáveis de ambiente novas)

### 6. Pronto
- Site público: `https://SEU-PROJETO.vercel.app`
- Painel admin: `https://SEU-PROJETO.vercel.app/admin`

## Editando depois
Sempre que quiser mudar preço ou área de entrega, é só entrar em `/admin`,
digitar a senha, editar os campos e clicar em "Salvar alterações". O site
público atualiza na hora, sem precisar mexer em código ou redeployar.

## Domínio próprio (opcional, depois)
Se seu patrão topar, dá pra comprar um domínio (ex: saofranciscogas.com.br)
e conectar direto na Vercel em "Settings" → "Domains". Isso não é obrigatório
pra funcionar — o endereço `.vercel.app` gratuito já funciona perfeitamente.
