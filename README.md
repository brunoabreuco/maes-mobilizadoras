# Aplicativo Mães-Mobilizadoras
## Um aplicativo de organização com funções de cadastramento de eventos e emissão de notificações dos mesmos.
[![Last commit](https://img.shields.io/github/last-commit/brunoabreuco/maes-mobilizadoras)]
[![Issues](https://img.shields.io/github/issues/brunoabreuco/maes-mobilizadoras)]
[![Top language](https://img.shields.io/github/languages/top/brunoabreuco/maes-mobilizadoras)]
[![Repo size](https://img.shields.io/github/repo-size/brunoabreuco/maes-mobilizadoras)]

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-a08021?style=for-the-badge&logo=firebase&logoColor=ffcd34)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white)
![Pydantic](https://img.shields.io/badge/pydantic-%23E92063.svg?style=for-the-badge&logo=pydantic&logoColor=white)
![Pytest](https://img.shields.io/badge/pytest-%23ffffff.svg?style=for-the-badge&logo=pytest&logoColor=2f9fe3)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Selenium](https://img.shields.io/badge/-selenium-%43B02A?style=for-the-badge&logo=selenium&logoColor=white)

### Público-alvo
As mães mobilizadoras são uma equipe de mulheres que oferecem serviços e auxílio geral para gestantes e mães do distrito de Parelheiros, no extremo sul da cidade de São Paulo. Este aplicativo foi designado para servir como portal de comunicação principal entre elas e as consumidoras de seus serviços.

### Funcionalidades-Chave
- um calendário com marcações coloridas correspondentes às datas dos eventos cuja presença foi confirmada pelo usuário.
- uma lista de todas as ações comunitárias cadastradas até o momento e suas informações detalhadas, com as opções de confirmar ou cancelar participação;
- uma tela exclusiva para notificações relevantes, como novas ações e lembretes;
- uma tela de perfil com as estatísticas de participação do usuário.

O aplicativo conta com diferentes funcionalidades dependendo da identidade da pessoa cadastrada. Caso ela faça parte da associação, ela também pode:
- criar novos eventos (nome, tipo de evento, data, horário, local e descrição);
- enviar notificações e atualizações dos eventos;
- caso seja coordenadora, conceder status de mobilizadora para uma usuária comum, liberando as funcionalidades mencionadas acima.

...existing code...

### Guia de Instalação

1) Pré-requisitos
- Python (veja `backend/README.md` para versão recomendada).
- git.
- Opcional: Docker/Docker Compose.

2) Clonar o repositório
```sh
git clone https://github.com/brunoabreuco/maes-mobilizadoras.git
cd maes-mobilizadoras
```

3) Backend — ambiente virtual e dependências
```sh
cd backend
python -m venv .venv
source .venv/bin/activate    # Linux/macOS

pip install --upgrade pip
pip install -r requirements.txt
```
(Arquivo usado: `backend/requirements.txt`)

4) Variáveis de ambiente
- Copie o exemplo e edite:
```sh
cp .env.example .env
```
- Variáveis principais:
  - DATABASE_URL — string de conexão do banco (por padrão pode usar sqlite em `instance/app.db`).
  - JWT_SECRET — chave secreta para tokens.
  - FIREBASE_SERVICE_ACCOUNT_JSON — JSON do service account (se usar Firebase).
  - AUTO_MIGRATE — `true` para criar tabelas e seed em dev.

Veja `backend/.env.example` e a inicialização em `backend/maes_mobilizadoras/app_factory.py`.

5) Rodar em desenvolvimento
Opção A — Flask CLI:
```sh
export FLASK_APP=app.py
export FLASK_ENV=development   # opcional
python -m flask run
```
Opção B — executar diretamente:
```sh
cd backend
python app.py
```
- O backend expõe a API e serve o frontend estático (padrão).

6) Frontend
- A interface está em `frontend/`. Você pode:
  - Abrir diretamente `frontend/tela-cadastro.html` no navegador, ou
  - Rodar o backend e acessar a rota raiz para que o Flask sirva a página.

7) Testes
```sh
cd backend
source .venv/bin/activate
pytest
```
(Os testes estão em `backend/tests`.)

8) Produção (breve)
- Use um servidor WSGI (ex.: gunicorn) e configure variáveis de ambiente adequadas:
```sh
cd backend
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```
- Garanta `JWT_SECRET` seguro e um banco de produção configurado em `DATABASE_URL`.

9) Dicas e resolução de problemas
- Se usar Firebase, confirme a validade de `FIREBASE_SERVICE_ACCOUNT_JSON`.
- Se AUTO_MIGRATE falhar, verifique permissões no diretório `instance/` e o valor de `DATABASE_URL`.
- Logs do Flask mostram inicialização e erros de configuração.
