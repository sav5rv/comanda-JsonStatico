document.addEventListener('DOMContentLoaded', () => {
    const quantidadeInput = document.getElementById('quantidade');
    const produtoSelect = document.getElementById('produtoSelect');
    const precoUnitarioAutomaticoInput = document.getElementById('precoUnitarioAutomatico');
    const adicionarProdutoBtn = document.getElementById('adicionarProduto');
    const corpoTabela = document.getElementById('corpoTabela');
    const totalGeralSpan = document.getElementById('totalGeral');

    let produtosDisponiveis = []; // Array para armazenar os produtos carregados do JSON
    let comandaItens = []; // Array para armazenar os itens na comanda atual

    // --- FUNÇÃO PARA CARREGAR PRODUTOS DO ARQUIVO JSON ---
    async function carregarProdutosDoServidor() {
        try {
            // Faz uma requisição para o arquivo produtos.json no servidor
            const response = await fetch('produtos.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            produtosDisponiveis = await response.json(); // Armazena os produtos
            preencherSelectProdutos(); // Preenche o dropdown com os produtos carregados
            console.log('Produtos carregados do servidor:', produtosDisponiveis);
        } catch (error) {
            console.error('Não foi possível carregar os produtos do servidor:', error);
            // Mensagem amigável para o usuário, se necessário
            alert('Erro ao carregar a lista de produtos. Tente recarregar a página.');
        }
    }

    // --- FUNÇÃO PARA PREENCHER O DROPDOWN DE PRODUTOS ---
    function preencherSelectProdutos() {
        produtoSelect.innerHTML = '<option value="">Selecione um produto</option>'; // Limpa e adiciona a opção padrão
        produtosDisponiveis.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.id; // Usamos o ID para o valor
            option.textContent = `${produto.nome} (R$ ${produto.preco.toFixed(2).replace('.', ',')})`;
            produtoSelect.appendChild(option);
        });
    }

    // --- ATUALIZA O PREÇO UNITÁRIO QUANDO UM PRODUTO É SELECIONADO ---
    produtoSelect.addEventListener('change', () => {
        const produtoId = produtoSelect.value;
        const produtoSelecionado = produtosDisponiveis.find(p => p.id === produtoId);
        if (produtoSelecionado) {
            precoUnitarioAutomaticoInput.value = produtoSelecionado.preco.toFixed(2);
        } else {
            precoUnitarioAutomaticoInput.value = '0.00';
        }
    });

    // --- ADICIONA PRODUTO À COMANDA ---
    adicionarProdutoBtn.addEventListener('click', () => {
        const quantidade = parseInt(quantidadeInput.value);
        const produtoId = produtoSelect.value;

        if (quantidade <= 0 || !produtoId) {
            alert('Por favor, selecione um produto e insira uma quantidade válida.');
            return;
        }

        const produtoSelecionado = produtosDisponiveis.find(p => p.id === produtoId);

        if (!produtoSelecionado) {
            alert('Produto não encontrado.');
            return;
        }

        const precoTotalItem = quantidade * produtoSelecionado.preco;

        const itemExistenteIndex = comandaItens.findIndex(item => item.produto.id === produtoId);

        if (itemExistenteIndex > -1) {
            // Atualiza quantidade e total de item existente
            comandaItens[itemExistenteIndex].quantidade += quantidade;
            comandaItens[itemExistenteIndex].total += precoTotalItem;
        } else {
            // Adiciona novo item
            comandaItens.push({
                produto: produtoSelecionado,
                quantidade: quantidade,
                total: precoTotalItem
            });
        }

        renderizarTabelaComanda();
        calcularTotalGeral();
        // Limpa campos após adicionar
        quantidadeInput.value = '1';
        produtoSelect.value = '';
        precoUnitarioAutomaticoInput.value = '0.00';
    });

    // --- RENDERIZA OS ITENS NA TABELA DA COMANDA ---
    function renderizarTabelaComanda() {
        corpoTabela.innerHTML = ''; // Limpa a tabela
        comandaItens.forEach((item, index) => {
            const row = corpoTabela.insertRow();
            row.innerHTML = `
                <td>${item.quantidade}</td>
                <td>${item.produto.nome}</td>
                <td class="text-end">R$ ${item.total.toFixed(2).replace('.', ',')}</td>
                <td><button type="button" class="btn btn-danger btn-sm remover-item" data-index="${index}">Remover</button></td>
            `;
        });
    }

    // --- CALCULA E EXIBE O TOTAL GERAL DA COMANDA ---
    function calcularTotalGeral() {
        const total = comandaItens.reduce((sum, item) => sum + item.total, 0);
        totalGeralSpan.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    // --- REMOVER ITEM DA COMANDA ---
    corpoTabela.addEventListener('click', (event) => {
        if (event.target.classList.contains('remover-item')) {
            const index = parseInt(event.target.dataset.index);
            comandaItens.splice(index, 1); // Remove o item do array
            renderizarTabelaComanda(); // Renderiza a tabela novamente
            calcularTotalGeral(); // Recalcula o total
        }
    });

    // --- INICIALIZAÇÃO: CARREGA OS PRODUTOS QUANDO A PÁGINA É CARREGADA ---
    carregarProdutosDoServidor(); // Chama a função para carregar os produtos do JSON
});