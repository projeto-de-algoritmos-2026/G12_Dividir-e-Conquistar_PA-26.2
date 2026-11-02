# Gosto em Comum

Site em Nuxt onde cada pessoa entra com um apelido, escolhe e ordena (arrastando) as suas 10
músicas favoritas e descobre quem tem o gosto mais parecido com o seu, além de receber
recomendações de músicas. A semelhança entre duas pessoas é medida **contando inversões com
divisão e conquista** (merge sort).

## Como rodar

Requer Node 22 e npm.

```bash
npm install
npm run dev                       # http://localhost:3000
npm run build && npm run preview  # versão de produção
```

Na primeira inicialização é criado o banco SQLite em `.data/app.db`, com ~320 músicas em 8
gêneros e 60 perfis de exemplo (`server/seed/`). Para recomeçar do zero, apague `.data/` e suba o
servidor de novo.

Outros scripts:

| Script | O que faz |
|--------|-----------|
| `npm run typecheck` | verificação de tipos (TypeScript + Vue) |
| `npm run seed:stress` | cria 1.000 perfis de exemplo extras e mede o tempo do cálculo |

## Telas

| Rota | Conteúdo |
|------|----------|
| `/` | entrada por apelido (o mesmo apelido volta ao mesmo perfil) |
| `/ranking` | busca no catálogo e ordenação das 10 músicas arrastando |
| `/semelhantes` | perfis com pelo menos 3 músicas em comum, do mais para o menos parecido |
| `/recomendacoes` | até 10 músicas vindas das 5 pessoas mais parecidas |
| `/comparar/<apelido>` | músicas em comum, pares invertidos e o merge sort passo a passo |
| `/pessoas` | todas as pessoas com ranking, com busca por apelido |
| `/pessoas/<apelido>` | o ranking de uma pessoa, com as músicas em comum e a semelhança com você |

## Vídeo

[Link do YouTube](https://youtu.be/AZWsZujqPdA)

## O algoritmo

### Inversões

Uma **inversão** num array é um par de índices `i < j` com `a[i] > a[j]`. Comparar todos os pares
custa O(n²). Com divisão e conquista o custo cai para **O(n log n)**:

1. **Dividir**: parte o array ao meio.
2. **Conquistar**: conta recursivamente as inversões de cada metade (que voltam ordenadas).
3. **Combinar**: mescla as duas metades ordenadas. Quando o menor elemento disponível vem da
   metade **direita**, ele é menor que todos os que ainda restam na **esquerda**, e cada um deles
   forma uma inversão com ele. Somamos de uma vez `tamanho da esquerda − i`.

Total = inversões da esquerda + inversões da direita + inversões contadas na mescla.

Implementação: [`shared/algorithms/inversions.ts`](shared/algorithms/inversions.ts)
(`countInversions`, e `countInversionsTraced`, que faz a mesma recursão registrando os passos e
os pares para a tela de detalhe).

### Da comparação de rankings à contagem de inversões

Dados o meu ranking e o de outra pessoa:

1. pego as `k` músicas que estão nos dois, **na minha ordem**;
2. troco cada uma pela **posição que ela tem no ranking da outra pessoa**;
3. conto as inversões desse array.

Se concordássemos em tudo, o array estaria em ordem crescente (0 inversões). Cada inversão é um
par de músicas que ordenamos de forma diferente, ou seja, a distância de Kendall tau. Exemplo:

```text
minha ordem:        Creep   Wonderwall   Hey Jude   Let It Be
posição no outro:     3         1           4           2      →  [3, 1, 4, 2]
inversões: (3,1) (3,2) (4,2) = 3 de 6 pares possíveis
```

**Semelhança** = `1 − inversões / (k(k−1)/2)`, exibida em porcentagem. Só comparamos pessoas
com `k ≥ 3` músicas em comum. Código: [`shared/algorithms/similarity.ts`](shared/algorithms/similarity.ts).

### Recomendações

Das 5 pessoas mais parecidas, cada música que não está no meu ranking ganha
`semelhança × (11 − posição no ranking dela)` pontos. Músicas que aparecem em mais de uma pessoa
somam os pontos. Mostramos as 10 de maior pontuação.
Código: [`shared/algorithms/recommend.ts`](shared/algorithms/recommend.ts).

## Estrutura

```text
app/          páginas, componentes e composables (Vue + Nuxt UI)
server/       rotas de API (Nitro), banco SQLite (better-sqlite3) e seed
shared/       tipos e algoritmos puros, sem dependência de UI ou banco
```
