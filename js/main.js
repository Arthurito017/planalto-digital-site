(function () {
  'use strict';

  // Número no formato internacional, só dígitos. Ex.: 5561999999999
  var WHATSAPP = '5561998639747';

  var movimentoReduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var limitar = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* Títulos: separa em palavras preservando <em> */
  function dividir(el) {
    var indice = 0;
    function percorrer(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (filho) {
        if (filho.nodeType === 3) {
          var frag = document.createDocumentFragment();
          filho.textContent.split(/(\s+)/).forEach(function (parte) {
            if (!parte) return;
            if (/^\s+$/.test(parte)) { frag.appendChild(document.createTextNode(' ')); return; }
            var externo = document.createElement('span');
            var interno = document.createElement('span');
            externo.className = 'palavra';
            interno.textContent = parte;
            interno.style.setProperty('--atraso', (indice++ * 0.045) + 's');
            externo.appendChild(interno);
            frag.appendChild(externo);
          });
          no.replaceChild(frag, filho);
        } else if (filho.nodeType === 1) {
          percorrer(filho);
        }
      });
    }
    percorrer(el);
  }

  if (!movimentoReduzido) $$('[data-split]').forEach(dividir);

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('visivel');
      observador.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('[data-reveal], [data-split]').forEach(function (el) { observador.observe(el); });

  /* Diagnóstico: o scroll troca a tela do celular */
  var diag = $('[data-diag]');
  var botoesDiag = $$('[data-passo]');
  var telas = $$('[data-tela]');
  var passoAtual = -1;

  function mostrarPasso(n) {
    if (n === passoAtual) return;
    passoAtual = n;
    botoesDiag.forEach(function (b, i) {
      b.classList.toggle('ativo', i === n);
      b.setAttribute('aria-pressed', String(i === n));
    });
    telas.forEach(function (t, i) { t.classList.toggle('ativa', i === n); });
  }

  botoesDiag.forEach(function (b, i) {
    b.addEventListener('click', function () {
      var r = diag.getBoundingClientRect();
      var percurso = diag.offsetHeight - innerHeight;
      scrollTo({ top: scrollY + r.top + percurso * ((i + 0.5) / botoesDiag.length) });
    });
  });

  /* Método: rolagem horizontal, só com tela larga e movimento permitido */
  var metodo = $('[data-horizontal]');
  var trilho = $('[data-horizontal-trilho]');
  var telaLarga = matchMedia('(min-width: 1000px) and (min-height: 620px)');
  var percursoHorizontal = 0;

  function medirHorizontal() {
    var ativo = telaLarga.matches && !movimentoReduzido;
    metodo.classList.toggle('horizontal-ativo', ativo);
    trilho.style.transform = '';
    metodo.style.height = '';
    if (!ativo) { percursoHorizontal = 0; return; }
    percursoHorizontal = Math.max(0, trilho.scrollWidth - innerWidth);
    metodo.style.height = (percursoHorizontal + innerHeight) + 'px';
  }

  /* Ciclo de scroll */
  var topo = $('[data-topo]');
  var trilha = $('[data-trilha]');
  var trilhaLuz = $('[data-trilha-luz]');
  var nos = $$('[data-no]');
  var secoes = $$('[data-secao]');
  var camadas = $$('[data-profundidade]');
  var rota = $('[data-rota]');
  var rotaLuz = $('[data-rota-luz]');
  var ultimoY = 0;
  var agendado = false;

  function aoRolar() {
    agendado = false;
    var y = scrollY;
    var total = document.documentElement.scrollHeight - innerHeight;
    var alto = innerHeight;

    topo.classList.toggle('fixado', y > 30);
    topo.classList.toggle('oculto', y > ultimoY && y > 500);
    ultimoY = y;

    trilhaLuz.style.transform = 'scaleY(' + (total > 0 ? y / total : 0) + ')';

    var atual = secoes[0].id;
    secoes.forEach(function (s) { if (s.getBoundingClientRect().top <= alto * 0.5) atual = s.id; });
    nos.forEach(function (n) { n.classList.toggle('ativo', n.dataset.no === atual); });
    trilha.classList.toggle('recolhida', atual === 'metodo' && percursoHorizontal > 0);

    var rd = diag.getBoundingClientRect();
    var pd = limitar(-rd.top / Math.max(1, diag.offsetHeight - alto), 0, 0.999);
    mostrarPasso(Math.floor(pd * botoesDiag.length));

    if (percursoHorizontal) {
      var rm = metodo.getBoundingClientRect();
      var pm = limitar(-rm.top / percursoHorizontal, 0, 1);
      trilho.style.transform = 'translate3d(' + (-pm * percursoHorizontal) + 'px,0,0)';
    }

    if (!movimentoReduzido && y < alto * 1.2) {
      camadas.forEach(function (c) {
        c.style.transform = 'translateY(' + (-y * parseFloat(c.dataset.profundidade)) + 'px)';
      });
    }

    var rr = rota.getBoundingClientRect();
    rotaLuz.style.strokeDashoffset = String(1 - limitar((alto * 0.85 - rr.top) / (alto * 0.7), 0, 1));
  }

  function pedirQuadro() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(aoRolar);
  }

  addEventListener('scroll', pedirQuadro, { passive: true });
  addEventListener('resize', function () { medirHorizontal(); pedirQuadro(); });
  addEventListener('load', function () { medirHorizontal(); pedirQuadro(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { medirHorizontal(); pedirQuadro(); });

  /* Portfólio: projetos conceito, sempre com clínicas fictícias */
  var projetos = [
    {
      aba: 'Odontologia', nome: 'Odonto Ipê', tipo: 'Clínica odontológica fictícia · Asa Sul', url: 'odontoipe.exemplo',
      cores: { fundo: '#F7F4EA', tinta: '#26332D', marca: '#1F4D43', acento: '#D8B24A' },
      titulo: 'Cuidado que dá vontade de voltar.', texto: 'Implantes, ortodontia e clínica geral em um atendimento sem pressa.',
      menu: ['Tratamentos', 'Equipe', 'Como chegar'], rt: 'Responsável técnico: nome · CRO-DF 00000',
      antigo: ['BEM VINDO A NOSSA CLINICA!!!', 'A clínica é referência e oferece todos os tipos de tratamento. Ligue no telefone abaixo ou venha nos visitar.'],
      lista: ['Especialidades organizadas por necessidade do paciente', 'WhatsApp sempre à mão no celular', 'Responsável técnico visível em todas as páginas']
    },
    {
      aba: 'Estética', nome: 'Ateliê Cerrado', tipo: 'Clínica de estética fictícia · Águas Lindas', url: 'ateliecerrado.exemplo',
      cores: { fundo: '#F5ECE4', tinta: '#3B2A25', marca: '#7A3F2E', acento: '#D39B7C' },
      titulo: 'Sua pele, no seu tempo.', texto: 'Protocolos faciais e corporais explicados com clareza, sem promessa milagrosa.',
      menu: ['Protocolos', 'Sobre', 'Agendar'], rt: 'Responsável técnico: nome · registro profissional',
      antigo: ['ESTETICA E BELEZA - PROMOÇÃO', 'Faça sua avaliação! Temos muitos procedimentos. Siga o nosso Instagram para ver as novidades e os preços.'],
      lista: ['Cada procedimento com página própria e dúvidas frequentes', 'Linguagem cuidadosa, sem promessa de resultado', 'Agendamento pelo WhatsApp com a mensagem pronta']
    },
    {
      aba: 'Reabilitação oral', nome: 'Clínica Vértice', tipo: 'Clínica odontológica fictícia · Águas Claras', url: 'clinicavertice.exemplo',
      cores: { fundo: '#F1F0F4', tinta: '#29263A', marca: '#3D3468', acento: '#A99BD0' },
      titulo: 'Decisões grandes pedem clareza.', texto: 'Tratamentos complexos explicados por etapas, para decidir com segurança.',
      menu: ['Tratamentos', 'Etapas', 'Avaliação'], rt: 'Responsável técnico: nome · CRO-DF 00000',
      antigo: ['Clinica Odontologica - Site Oficial', 'Página em construção. Em breve mais informações sobre os nossos tratamentos. Última atualização em 2016.'],
      lista: ['Jornada do tratamento explicada passo a passo', 'Páginas por especialidade, preparadas para a busca local', 'Credenciais da equipe em destaque']
    }
  ];

  var abas = $('[data-abas]');
  var area = $('[data-area]');
  var faixa = $('[data-faixa]');
  var antes = $('[data-antes]');
  var depois = $('[data-depois]');

  function escrever(pai, tag, texto, classe) {
    var el = document.createElement(tag);
    if (texto) el.textContent = texto;
    if (classe) el.className = classe;
    pai.appendChild(el);
    return el;
  }

  function mostrarProjeto(i) {
    var p = projetos[i];
    $$('button', abas).forEach(function (b, n) {
      b.setAttribute('aria-selected', String(n === i));
      b.tabIndex = n === i ? 0 : -1;
    });
    $('[data-url]').textContent = p.url;
    $('[data-ficha-nome]').textContent = p.nome;
    $('[data-ficha-tipo]').textContent = p.tipo;

    var lista = $('[data-ficha-lista]');
    lista.textContent = '';
    p.lista.forEach(function (t) { escrever(lista, 'li', t); });

    antes.textContent = '';
    escrever(antes, 'div', p.antigo[0], 'ma-topo');
    escrever(antes, 'div', 'Início | Clínica | Serviços | Fale Conosco', 'ma-menu');
    var corpoA = escrever(antes, 'div', '', 'ma-corpo');
    escrever(corpoA, 'div', 'foto.jpg', 'ma-foto');
    var textoA = escrever(corpoA, 'div');
    escrever(textoA, 'h4', 'Seja bem vindo');
    escrever(textoA, 'p', p.antigo[1]);
    escrever(textoA, 'span', 'CLIQUE AQUI', 'ma-botao');
    escrever(antes, 'div', 'Melhor visualizado em resolução 1024x768 · © 2014', 'ma-rodape');

    depois.textContent = '';
    ['fundo', 'tinta', 'marca', 'acento'].forEach(function (c) {
      depois.style.setProperty('--c-' + c, p.cores[c]);
    });
    var topoN = escrever(depois, 'div', '', 'mn-topo');
    escrever(topoN, 'b', p.nome);
    var menuN = escrever(topoN, 'div', '', 'mn-menu');
    p.menu.forEach(function (m) { escrever(menuN, 'span', m); });
    var corpoN = escrever(depois, 'div', '', 'mn-corpo');
    var textoN = escrever(corpoN, 'div');
    escrever(textoN, 'h4', p.titulo);
    escrever(textoN, 'p', p.texto);
    escrever(textoN, 'span', 'Agendar pelo WhatsApp', 'mn-botao');
    escrever(corpoN, 'div', '', 'mn-foto');
    var rodapeN = escrever(depois, 'div', '', 'mn-rodape');
    escrever(rodapeN, 'span', p.rt);
    escrever(rodapeN, 'span', 'Clínica fictícia');
  }

  projetos.forEach(function (p, i) {
    var b = escrever(abas, 'button', p.aba);
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.addEventListener('click', function () { mostrarProjeto(i); });
    b.addEventListener('keydown', function (e) {
      var passo = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!passo) return;
      var alvo = (i + passo + projetos.length) % projetos.length;
      mostrarProjeto(alvo);
      $$('button', abas)[alvo].focus();
    });
  });
  mostrarProjeto(0);

  faixa.addEventListener('input', function () { area.style.setProperty('--p', faixa.value + '%'); });

  /* Na primeira aparição, o comparador mostra sozinho que é arrastável */
  if (!movimentoReduzido) {
    new IntersectionObserver(function (entradas, obs) {
      if (!entradas[0].isIntersecting) return;
      obs.disconnect();
      var inicio = null;
      function animar(t) {
        if (inicio === null) inicio = t;
        var p = (t - inicio) / 1800;
        if (p >= 1) { area.style.setProperty('--p', '50%'); return; }
        area.style.setProperty('--p', (50 + Math.sin(p * Math.PI * 2) * 26) + '%');
        requestAnimationFrame(animar);
      }
      requestAnimationFrame(animar);
    }, { threshold: 0.6 }).observe(area);
  }

  /* Regiões */
  var pontos = $$('[data-cidade]');
  pontos.forEach(function (ponto) {
    ponto.addEventListener('click', function () {
      pontos.forEach(function (p) { p.classList.toggle('ativo', p === ponto); });
      $$('[data-painel]').forEach(function (d) { d.hidden = d.dataset.painel !== ponto.dataset.cidade; });
    });
  });

  /* Detalhes finos só para quem tem mouse */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !movimentoReduzido) {
    $$('[data-brilho]').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--x', (e.clientX - r.left) + 'px');
        c.style.setProperty('--y', (e.clientY - r.top) + 'px');
      });
    });

    $$('[data-ima]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = 'translate(' + dx * 0.12 + 'px,' + dy * 0.22 + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });

    var arte = $('[data-hero-arte]');
    var svgArte = $('svg', arte);
    $('.hero').addEventListener('pointermove', function (e) {
      var x = (e.clientX / innerWidth - 0.5) * 2;
      var y = (e.clientY / innerHeight - 0.5) * 2;
      svgArte.style.transform = 'perspective(1100px) rotateY(' + x * 3 + 'deg) rotateX(' + -y * 3 + 'deg)';
    });
    svgArte.style.transition = 'transform .6s cubic-bezier(.2,.7,.2,1)';
  }

  /* Formulário: abre o WhatsApp com a mensagem pronta; nada é armazenado */
  var form = $('[data-formulario]');
  var status = $('[data-status]');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var dados = new FormData(form);
    var faltando = ['nome', 'clinica'].filter(function (k) {
      var vazio = !String(dados.get(k)).trim();
      form.elements[k].classList.toggle('erro', vazio);
      form.elements[k].setAttribute('aria-invalid', String(vazio));
      return vazio;
    });
    if (faltando.length) {
      status.textContent = 'Preencha seu nome e o nome da clínica para continuar.';
      form.elements[faltando[0]].focus();
      return;
    }
    var site = String(dados.get('site')).trim();
    var mensagem = 'Olá! Sou ' + String(dados.get('nome')).trim() + ', da clínica ' + String(dados.get('clinica')).trim() +
      ', em ' + dados.get('cidade') + '. ' + (site ? 'Nosso site atual é ' + site + '. ' : 'Ainda não temos site. ') +
      'Gostaria de ver um protótipo, sem compromisso.';
    if (!WHATSAPP) {
      status.textContent = 'O número de WhatsApp da Planalto Digital ainda está sendo configurado.';
      return;
    }
    status.textContent = '';
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensagem), '_blank', 'noopener');
  });

  $('[data-ano]').textContent = new Date().getFullYear();

  medirHorizontal();
  aoRolar();
})();
