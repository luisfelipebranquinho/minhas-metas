# Minhas Metas

Site pessoal de metas para celular: metas em calendário com "bater ponto", botão *Vacilei* (limite de 10), medalhas por dias seguidos (7 dias → 1 ano) e faixas de jiu-jítsu pela soma dos dias cumpridos.

- **Hospedagem:** GitHub Pages (arquivo único `index.html`).
- **Banco:** Supabase. As tabelas ficam fechadas; o site só fala com o banco por funções que conferem a sessão de cada conta.
- **Login:** usuário e senha, sem e-mail. A senha nunca sai do celular: o servidor recebe só um segredo derivado dela (e guarda o hash bcrypt). 5 erros seguidos travam a conta por 10 minutos.
- **Criptografia:** os dados são cifrados no próprio celular (AES-GCM 256, chave derivada da senha com PBKDF2-SHA256, 310 mil iterações) antes de ir para o banco. O servidor só guarda texto cifrado. Sem a senha, não há como recuperar os dados.
- **Só celular:** computadores e tablets são bloqueados, e há detecção de celular simulado no computador.

A chave pública do Supabase no código é a *publishable key*, feita para ficar no navegador; a proteção vem das funções com sessão e da criptografia.
