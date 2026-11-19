import type { FormDefinition, FormPage } from "./form-types";
import {
  agentesNocivos,
  asMulti,
  diasTrabalho,
  formaPagamento,
  formaRegistroPonto,
  freqSemana,
  isNao,
  isSim,
  meioTransporte,
  percentualInsalubridade,
  periodicidadePagamento,
  provasSemCarteira,
  simNao,
  simNaoNaoSei,
  situacaoTrabalho,
  tipoRegistroPonto,
  usuariosBanheiro,
  valeAlimentacao,
} from "./options";

const consentPage: FormPage = {
  id: "consentimento",
  title: "Declaração de Consentimento e Confidencialidade",
  description:
    "Antes de prosseguir, informamos que as informações fornecidas neste formulário serão utilizadas exclusivamente para a análise preliminar do seu caso jurídico. Seus dados pessoais serão tratados em conformidade com a Lei Geral de Proteção de Dados (LGPD) e com o Código de Ética e Disciplina da OAB, garantindo sigilo absoluto.",
  fields: [
    {
      id: "consentimento_lgpd",
      type: "choice",
      label: "Deseja continuar?",
      required: true,
      options: simNao,
    },
  ],
  earlyExitWhen: (a) => isNao(a.consentimento_lgpd),
  earlyExitMessage:
    "Sem o consentimento não podemos analisar o caso. Se mudar de ideia, volte e aceite para continuar.",
};

const dadosPage: FormPage = {
  id: "dados",
  title: "Seus dados",
  fields: [
    {
      id: "nome_completo",
      type: "text",
      label: "Nome completo",
      required: true,
      placeholder: "Nome completo",
    },
    {
      id: "telefone",
      type: "phone",
      label: "Telefone com DDD",
      required: true,
      placeholder: "(11) 99999-9999",
    },
  ],
};

const vinculoShared: FormPage = {
  id: "vinculo",
  title: "Prescrição e vínculo",
  fields: [
    {
      id: "caso_mais_de_2_anos",
      type: "choice",
      label: "Seu caso ocorreu há mais de 2 anos?",
      required: true,
      options: simNao,
    },
    {
      id: "prescricao_aviso",
      type: "info",
      label: "Atenção — possível prescrição",
      help: "Casos com fatos ocorridos há mais de 2 anos podem estar prescritos. Você pode enviar o que já preencheu para análise preliminar da equipe.",
      showWhen: (a) => isSim(a.caso_mais_de_2_anos),
    },
    {
      id: "carteira_assinada",
      type: "choice",
      label: "Carteira assinada?",
      required: true,
      options: simNao,
      showWhen: (a) => isNao(a.caso_mais_de_2_anos),
    },
    {
      id: "prestacao_habitual_subordinada",
      type: "choice",
      label:
        "Você presta ou prestou serviços mais de 2x na semana para essa empresa ou pessoa física, cumprindo horários e recebendo ordens?",
      required: true,
      options: simNao,
      showWhen: (a) => isNao(a.caso_mais_de_2_anos) && isNao(a.carteira_assinada),
    },
    {
      id: "sem_vinculo_aviso",
      type: "info",
      label: "Possível ausência de vínculo",
      help: "Sem carteira e sem habitualidade/subordinação, pode não haver vínculo empregatício. Encerraremos aqui para análise da equipe.",
      showWhen: (a) =>
        isNao(a.caso_mais_de_2_anos) &&
        isNao(a.carteira_assinada) &&
        isNao(a.prestacao_habitual_subordinada),
    },
    {
      id: "provas_sem_carteira",
      type: "multi",
      label: "Quais provas de que trabalhou sem carteira assinada você tem?",
      required: true,
      options: provasSemCarteira,
      showWhen: (a) =>
        isNao(a.caso_mais_de_2_anos) &&
        isNao(a.carteira_assinada) &&
        isSim(a.prestacao_habitual_subordinada),
    },
    {
      id: "provas_sem_carteira_outras",
      type: "textarea",
      label: "Quais outras provas?",
      required: true,
      placeholder: "Descreva as outras provas",
      showWhen: (a) =>
        isNao(a.caso_mais_de_2_anos) &&
        isNao(a.carteira_assinada) &&
        isSim(a.prestacao_habitual_subordinada) &&
        asMulti(a.provas_sem_carteira).includes("outras"),
    },
  ],
  earlyExitWhen: (a) =>
    isSim(a.caso_mais_de_2_anos) ||
    (isNao(a.caso_mais_de_2_anos) &&
      isNao(a.carteira_assinada) &&
      isNao(a.prestacao_habitual_subordinada)),
  earlyExitMessage:
    "Recebemos suas respostas iniciais. Nossa equipe analisará a viabilidade e entrará em contato se for o caso.",
};

const empresaPage: FormPage = {
  id: "empresa",
  title: "Dados da empresa",
  fields: [
    {
      id: "nome_empresa",
      type: "text",
      label: "Nome da empresa",
      required: true,
      placeholder: "De preferência a razão social",
    },
    { id: "cargo", type: "text", label: "Cargo", required: true },
    {
      id: "endereco_local_trabalho",
      type: "text",
      label: "Endereço do local onde trabalhava",
      required: true,
      placeholder: "Rua, número, bairro, cidade e estado",
    },
    {
      id: "cidade_uf_trabalho",
      type: "text",
      label: "Qual a cidade que você trabalhava? Qual Estado?",
      required: true,
    },
    {
      id: "qtd_funcionarios",
      type: "number",
      label: "Quantos funcionários tinham na empresa",
      required: true,
      placeholder: "Digite um número aproximado",
    },
    {
      id: "nome_responsavel",
      type: "text",
      label: "Nome do responsável",
      required: true,
      placeholder: "Nome completo, se possível",
    },
  ],
};

const processoPage: FormPage = {
  id: "processo",
  title: "Histórico com a empresa",
  fields: [
    {
      id: "ja_processou_empresa",
      type: "choice",
      label: "Você já processou essa empresa antes?",
      required: true,
      options: simNao,
    },
    {
      id: "recebia_seguro_desemprego",
      type: "choice",
      label: "Você estava recebendo seguro-desemprego no período que trabalhou na empresa?",
      required: true,
      options: simNao,
    },
  ],
};

const remuneracaoPage: FormPage = {
  id: "remuneracao",
  title: "Remuneração",
  fields: [
    {
      id: "salario_mensal",
      type: "text",
      label: "Salário",
      required: true,
      placeholder: "Qual o valor total recebido no mês?",
    },
    {
      id: "periodicidade_pagamento",
      type: "choice",
      label: "Pagamento feito por",
      required: true,
      options: periodicidadePagamento,
    },
    {
      id: "valor_pagamento_periodo",
      type: "text",
      label: "Quanto?",
      required: true,
      placeholder: "R$",
      showWhen: (a) =>
        Boolean(a.periodicidade_pagamento) && a.periodicidade_pagamento !== "mes",
    },
    {
      id: "assinava_recibo",
      type: "choice",
      label: "Assinava algum recibo de pagamento?",
      required: true,
      options: simNao,
    },
    {
      id: "forma_pagamento",
      type: "choice",
      label: "Pagamentos eram feitos via",
      required: true,
      options: formaPagamento,
    },
    {
      id: "forma_pagamento_outra",
      type: "text",
      label: "Qual?",
      required: true,
      showWhen: (a) => a.forma_pagamento === "outro",
    },
  ],
};

const atividadesPage: FormPage = {
  id: "atividades",
  title: "Rotina de trabalho",
  fields: [
    {
      id: "atividades_descricao",
      type: "textarea",
      label: "Descreva todas suas atividades no trabalho",
      required: true,
    },
  ],
};

function situacaoPage(useDatePicker: boolean): FormPage {
  return {
    id: "situacao",
    title: "Situação de trabalho",
    fields: [
      {
        id: useDatePicker ? "data_inicio" : "data_inicio_texto",
        type: useDatePicker ? "date" : "text",
        label: "Data de início do trabalho",
        required: true,
        placeholder: useDatePicker ? undefined : "Ex.: 15/03/2023",
      },
      {
        id: "situacao_trabalho",
        type: "choice",
        label: "Situação atual",
        required: true,
        options: situacaoTrabalho,
      },
      {
        id: "motivo_quer_pedir_demissao",
        type: "textarea",
        label:
          "Por quê você quer pedir demissão? A empresa descumpre alguma regra trabalhista?",
        required: true,
        placeholder: "Explique.",
        showWhen: (a) => a.situacao_trabalho === "ainda_trabalha",
      },
      {
        id: useDatePicker ? "data_demissao" : "data_demissao_texto",
        type: useDatePicker ? "date" : "text",
        label: "Quando ocorreu a demissão?",
        required: true,
        placeholder: useDatePicker ? undefined : "Ex.: 10/01/2025",
        showWhen: (a) =>
          a.situacao_trabalho === "dispensado_sem_justa_causa" ||
          a.situacao_trabalho === "dispensado_com_justa_causa",
      },
      {
        id: "recebeu_rescisao",
        type: "choice",
        label: "Recebeu algum valor de rescisão?",
        required: true,
        options: simNao,
        showWhen: (a) =>
          a.situacao_trabalho === "dispensado_sem_justa_causa" ||
          a.situacao_trabalho === "dispensado_com_justa_causa",
      },
      {
        id: "valor_rescisao",
        type: "number",
        label: "Qual valor? R$",
        required: true,
        placeholder: "Qual valor? R$",
        showWhen: (a) =>
          (a.situacao_trabalho === "dispensado_sem_justa_causa" ||
            a.situacao_trabalho === "dispensado_com_justa_causa") &&
          isSim(a.recebeu_rescisao),
      },
      {
        id: "motivo_dispensa",
        type: "textarea",
        label: "Por qual motivo você foi dispensado?",
        required: true,
        placeholder: "Explique.",
        showWhen: (a) => a.situacao_trabalho === "dispensado_sem_justa_causa",
      },
      {
        id: "motivo_justa_causa",
        type: "textarea",
        label: "Qual foi o motivo da justa causa?",
        required: true,
        placeholder: "Explique.",
        showWhen: (a) => a.situacao_trabalho === "dispensado_com_justa_causa",
      },
      {
        id: "data_pedido_demissao",
        type: "text",
        label: "Quando você pediu demissão?",
        required: true,
        showWhen: (a) => a.situacao_trabalho === "pediu_demissao",
      },
      {
        id: "demissao_homologada_sindicato",
        type: "choice",
        label: "Seu pedido de demissão foi homologado pelo sindicato?",
        required: true,
        options: simNaoNaoSei,
        showWhen: (a) => a.situacao_trabalho === "pediu_demissao",
      },
      {
        id: "motivo_pedido_demissao",
        type: "textarea",
        label: "Por qual motivo você pediu demissão?",
        required: true,
        placeholder: "Explique.",
        showWhen: (a) => a.situacao_trabalho === "pediu_demissao",
      },
    ],
  };
}

const jornadaPage: FormPage = {
  id: "jornada",
  title: "Horário de trabalho",
  fields: [
    { id: "horario_inicio", type: "text", label: "Horário de início", required: true, placeholder: "Ex.: 08:00" },
    { id: "horario_saida", type: "text", label: "Horário de saída", required: true, placeholder: "Ex.: 17:00" },
    {
      id: "dias_trabalhados",
      type: "multi",
      label: "Dias trabalhados",
      required: true,
      options: diasTrabalho,
    },
    {
      id: "chegava_mais_cedo",
      type: "choice",
      label: "Costumava chegar mais cedo no trabalho?",
      required: true,
      options: simNao,
    },
    {
      id: "horario_chegada_cedo",
      type: "text",
      label: "Qual horário?",
      required: true,
      showWhen: (a) => isSim(a.chegava_mais_cedo),
    },
    {
      id: "motivo_chegada_cedo",
      type: "text",
      label: "Por qual motivo?",
      required: true,
      showWhen: (a) => isSim(a.chegava_mais_cedo),
    },
    {
      id: "freq_chegada_cedo",
      type: "choice",
      label: "Em média quantas vezes costumava chegar mais cedo?",
      required: true,
      options: freqSemana,
      showWhen: (a) => isSim(a.chegava_mais_cedo),
    },
    {
      id: "saia_mais_tarde",
      type: "choice",
      label: "Costumava sair mais tarde do trabalho?",
      required: true,
      options: simNao,
    },
    {
      id: "horario_saida_tarde",
      type: "text",
      label: "Qual horário?",
      required: true,
      showWhen: (a) => isSim(a.saia_mais_tarde),
    },
    {
      id: "motivo_saida_tarde",
      type: "text",
      label: "Por qual motivo?",
      required: true,
      showWhen: (a) => isSim(a.saia_mais_tarde),
    },
    {
      id: "freq_saida_tarde",
      type: "choice",
      label: "Em média quantas vezes na semana saia mais tarde?",
      required: true,
      options: freqSemana,
      showWhen: (a) => isSim(a.saia_mais_tarde),
    },
    {
      id: "fazia_intervalo_completo",
      type: "choice",
      label: "Conseguia fazer todo o intervalo?",
      required: true,
      options: simNao,
    },
    {
      id: "motivo_intervalo_incompleto",
      type: "text",
      label: "Por qual motivo?",
      required: true,
      showWhen: (a) => isNao(a.fazia_intervalo_completo),
    },
    {
      id: "freq_intervalo_incompleto",
      type: "choice",
      label: "Em média quantas vezes na semana não conseguia fazer todo o intervalo?",
      required: true,
      options: freqSemana,
      showWhen: (a) => isNao(a.fazia_intervalo_completo),
    },
    {
      id: "tempo_intervalo",
      type: "text",
      label: "Quanto tempo costumava fazer de intervalo?",
      required: true,
      showWhen: (a) => isNao(a.fazia_intervalo_completo),
    },
  ],
};

const pontoPage: FormPage = {
  id: "ponto",
  title: "Cartão de ponto",
  fields: [
    {
      id: "tinha_cartao_ponto",
      type: "choice",
      label: "Tinha cartão ponto?",
      required: true,
      options: simNao,
    },
    {
      id: "registrava_cartao_ponto",
      type: "choice",
      label: "Registrava seu horário no cartão ponto?",
      required: true,
      options: simNao,
      showWhen: (a) => isSim(a.tinha_cartao_ponto),
    },
    {
      id: "tipo_registro_ponto",
      type: "choice",
      label: "Tipo de registro",
      required: true,
      options: tipoRegistroPonto,
      showWhen: (a) => isSim(a.tinha_cartao_ponto),
    },
    {
      id: "forma_registro_ponto",
      type: "choice",
      label: "Forma de registro",
      required: true,
      options: formaRegistroPonto,
      showWhen: (a) => isSim(a.tinha_cartao_ponto),
    },
  ],
};

const agentesPage: FormPage = {
  id: "agentes",
  title: "Insalubridade e periculosidade",
  fields: [
    {
      id: "ganhava_insalubridade",
      type: "choice",
      label: "Ganhava insalubridade?",
      required: true,
      options: simNaoNaoSei,
    },
    {
      id: "percentual_insalubridade",
      type: "choice",
      label: "Qual porcentagem?",
      required: true,
      options: percentualInsalubridade,
      showWhen: (a) => a.ganhava_insalubridade === "sim",
    },
    {
      id: "ganhava_periculosidade",
      type: "choice",
      label: "Ganhava periculosidade?",
      required: true,
      options: simNaoNaoSei,
    },
    {
      id: "limpava_banheiros",
      type: "choice",
      label: "Fazia limpeza de banheiros?",
      required: true,
      options: simNao,
    },
    {
      id: "limpava_banheiros_sozinho",
      type: "choice",
      label: "Limpava os banheiros sozinho(a)?",
      required: true,
      options: simNao,
      showWhen: (a) => isSim(a.limpava_banheiros),
    },
    {
      id: "usuarios_banheiro",
      type: "choice",
      label: "Em média quantas pessoas utilizavam o banheiro?",
      required: true,
      options: usuariosBanheiro,
      showWhen: (a) => isSim(a.limpava_banheiros),
    },
    {
      id: "qtd_vasos_sanitarios_dia",
      type: "text",
      label: "Em média quantos vasos sanitários limpava diariamente?",
      required: true,
      placeholder: "Digite um número",
      showWhen: (a) => isSim(a.limpava_banheiros),
    },
    {
      id: "acessava_camara_fria",
      type: "choice",
      label: "Acessava câmara fria?",
      required: true,
      options: simNao,
    },
    {
      id: "calor_excessivo",
      type: "choice",
      label: "Tinha contato com temperaturas muito elevadas (calor excessivo)?",
      required: true,
      options: simNao,
    },
    {
      id: "agentes_nocivos",
      type: "multi",
      label: "Lidava com",
      required: true,
      options: agentesNocivos,
    },
    {
      id: "agentes_nocivos_tipo",
      type: "text",
      label: "Qual tipo?",
      required: true,
      placeholder: "Ex: graxa mecânica, óleo de cozinha",
      showWhen: (a) => {
        const selected = asMulti(a.agentes_nocivos);
        return selected.length > 0 && !selected.includes("nenhum");
      },
    },
    {
      id: "eletrica_alto_risco",
      type: "choice",
      label: "Tinha contato com elétrica de alto risco?",
      required: true,
      options: simNao,
    },
  ],
};

const acidentePage: FormPage = {
  id: "acidente",
  title: "Acidente e INSS",
  fields: [
    {
      id: "acidente_ou_doenca_trabalho",
      type: "choice",
      label: "Sofreu algum acidente no trabalho ou teve doença do trabalho?",
      required: true,
      options: simNao,
    },
    {
      id: "acidente_doenca_detalhes",
      type: "textarea",
      label: "Explique o ocorrido",
      required: true,
      showWhen: (a) => isSim(a.acidente_ou_doenca_trabalho),
    },
    {
      id: "afastou_inss",
      type: "choice",
      label: "Já se afastou do trabalho pelo INSS?",
      required: true,
      options: simNao,
    },
  ],
};

const beneficiosPage: FormPage = {
  id: "beneficios",
  title: "VA/VR e transporte",
  fields: [
    {
      id: "vale_alimentacao_refeicao",
      type: "choice",
      label: "Recebia Vale Alimentação ou Vale Refeição (VA/VR)?",
      required: true,
      options: valeAlimentacao,
    },
    {
      id: "valor_va_vr",
      type: "text",
      label: "Qual valor?",
      required: true,
      showWhen: (a) =>
        Boolean(a.vale_alimentacao_refeicao) && a.vale_alimentacao_refeicao !== "nenhum",
    },
    {
      id: "meio_transporte",
      type: "choice",
      label: "Como ia para o trabalho?",
      required: true,
      options: meioTransporte,
    },
    {
      id: "gasto_transporte_mensal",
      type: "text",
      label: "Quanto gastava por mês?",
      required: true,
      showWhen: (a) =>
        a.meio_transporte === "conducao_propria" ||
        a.meio_transporte === "transporte_publico_proprio",
    },
    {
      id: "valor_vale_transporte",
      type: "text",
      label: "Qual valor do vale transporte?",
      required: true,
      showWhen: (a) => a.meio_transporte === "vale_transporte",
    },
  ],
};

const danosPage: FormPage = {
  id: "encerramento",
  title: "Danos morais e observações",
  fields: [
    {
      id: "danos_morais",
      type: "textarea",
      label: "Danos Morais",
      required: true,
      placeholder:
        "Espaço para comentar sobre acontecimentos que possam ter lhe ferido psicologicamente",
    },
    {
      id: "observacoes_adicionais",
      type: "textarea",
      label: "Há algo mais que queira nos contar?",
      required: false,
    },
  ],
};

const gestantePage: FormPage = {
  id: "gestante",
  title: "Sobre a gravidez",
  fields: [
    {
      id: "semanas_gestacao",
      type: "text",
      label: "Você está com quantas semanas de gravidez?",
      required: true,
      placeholder: "Ex.: 20",
    },
    {
      id: "informou_gravidez_empresa",
      type: "choice",
      label: "Você informou a empresa sobre a gravidez?",
      required: true,
      options: simNao,
    },
    {
      id: "data_comunicacao_gravidez",
      type: "text",
      label: "Quando a empresa foi comunicada?",
      required: true,
      showWhen: (a) => isSim(a.informou_gravidez_empresa),
    },
    {
      id: "possui_ultrassom",
      type: "choice",
      label: "Você possui exame de ultrassom da gravidez?",
      required: true,
      options: simNao,
    },
    {
      id: "data_prevista_parto",
      type: "text",
      label: "Qual a data prevista para seu parto?",
      required: true,
      placeholder: "Ex.: 15/05/2026",
    },
    {
      id: "ambiente_seguro_gravidez",
      type: "choice",
      label: "Seu ambiente de trabalho oferece condições seguras e adequadas para a gravidez?",
      required: true,
      options: simNao,
    },
    {
      id: "tarefas_risco_gestacao",
      type: "choice",
      label: "Alguma tarefa no seu trabalho representa risco para sua saúde ou do bebê?",
      required: true,
      options: simNao,
    },
    {
      id: "quais_tarefas_risco",
      type: "text",
      label: "Qual ou quais tarefas?",
      required: true,
      placeholder: "Qual ou quais tarefas?",
      showWhen: (a) => isSim(a.tarefas_risco_gestacao),
    },
    {
      id: "discriminacao_por_gravidez",
      type: "choice",
      label:
        "Você sofreu algum tipo de discriminação ou tratamento diferenciado na empresa por estar grávida?",
      required: true,
      options: simNao,
    },
    {
      id: "discriminacao_gravidez_detalhes",
      type: "textarea",
      label: "Explique o ocorrido",
      required: true,
      placeholder: "Explique o ocorrido.",
      showWhen: (a) => isSim(a.discriminacao_por_gravidez),
    },
    {
      id: "tem_relato_adicional_gravidez",
      type: "choice",
      label:
        "Há algo mais que você gostaria de relatar sobre sua situação no trabalho durante a gravidez?",
      required: true,
      options: simNao,
    },
    {
      id: "relato_adicional_gravidez",
      type: "textarea",
      label: "O que mais gostaria de compartilhar?",
      required: true,
      placeholder: "O que mais gostaria de compartilhar?",
      showWhen: (a) => isSim(a.tem_relato_adicional_gravidez),
    },
  ],
};

function sharedCore(useDatePicker: boolean): FormPage[] {
  return [
    consentPage,
    dadosPage,
    vinculoShared,
    empresaPage,
    processoPage,
    remuneracaoPage,
    atividadesPage,
    situacaoPage(useDatePicker),
    jornadaPage,
    pontoPage,
    agentesPage,
    acidentePage,
    beneficiosPage,
  ];
}

export const trabalhistaForm: FormDefinition = {
  source: "trabalhista",
  gestante: false,
  title: "Direito Trabalhista",
  subtitle: "Questionário de triagem — SFraga Advocacia",
  pages: [...sharedCore(true), danosPage],
};

export const gestanteForm: FormDefinition = {
  source: "gestante",
  gestante: true,
  title: "Direito da Gestante",
  subtitle: "Questionário de triagem — SFraga Advocacia",
  pages: [...sharedCore(false), gestantePage],
};

export function getFormDefinition(source: "trabalhista" | "gestante"): FormDefinition {
  return source === "gestante" ? gestanteForm : trabalhistaForm;
}
