// Textos da Política de Privacidade e dos Termos de Uso. Ao mudar o que o site
// coleta ou os serviços usados, atualize a Política e a data abaixo.

export const LEGAL_OWNER = "Vinícius Sacramento Bernardes";
export const LEGAL_EMAIL = "contato@roadcube.com.br";
export const LEGAL_UPDATED = "5 de novembro de 2026";

export interface LegalSection {
  title: string;
  /** Texto é parágrafo; lista de textos vira lista com marcadores. */
  body: (string | string[])[];
}

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "Quem cuida dos seus dados",
    body: [
      `O RoadCube é mantido por ${LEGAL_OWNER}, responsável pelo tratamento dos dados pessoais descrito aqui, nos termos da Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).`,
      `Para falar sobre privacidade, inclusive com a pessoa encarregada, escreva para ${LEGAL_EMAIL}.`,
    ],
  },
  {
    title: "Quais dados coletamos",
    body: [
      "Coletamos apenas o necessário para o RoadCube funcionar:",
      [
        "Conta: nome, e-mail e senha. A senha fica protegida no serviço de autenticação, e não temos acesso a ela.",
        "Perfil: foto ou avatar, se você escolher um, e suas preferências, como meta diária, velocidade das animações e sons.",
        "Uso do aprendizado: lições concluídas, pontos de experiência, vidas, ofensiva, histórico de lições, revisões, algoritmos preferidos e tempos de resolução.",
        "Dados técnicos: endereço IP, tipo de navegador, datas e horários de acesso e registros de erro, gerados pelos serviços que hospedam o site.",
      ],
      "Não pedimos dados sensíveis, como saúde, religião ou biometria. Evite enviar como avatar uma foto que revele esse tipo de informação.",
    ],
  },
  {
    title: "Para que usamos e com qual base legal",
    body: [
      [
        "Criar e manter sua conta, salvar seu progresso e oferecer as lições, o treino e a revisão: execução do contrato com você.",
        "Enviar e-mails necessários, como confirmação de cadastro e recuperação de senha: execução do contrato.",
        "Proteger o site, evitar fraudes e abusos e corrigir erros: legítimo interesse.",
        "Atender obrigações legais e pedidos de autoridades: cumprimento de obrigação legal.",
      ],
      "Não vendemos seus dados, não exibimos anúncios e não usamos ferramentas de análise de terceiros.",
    ],
  },
  {
    title: "Com quem compartilhamos",
    body: [
      "Usamos prestadores de serviço que tratam dados em nosso nome:",
      [
        "Supabase: banco de dados e autenticação.",
        "Vercel: hospedagem do site.",
        "Resend: envio dos e-mails da conta.",
      ],
      "Também podemos compartilhar dados quando a lei ou uma autoridade competente exigir. Outras pessoas que usam o RoadCube não veem seu perfil nem seu progresso.",
    ],
  },
  {
    title: "Transferência internacional",
    body: [
      "Esses prestadores podem armazenar ou processar dados em servidores fora do Brasil, inclusive nos Estados Unidos. Quando isso acontece, a transferência é necessária para oferecer o serviço e segue as regras da LGPD.",
    ],
  },
  {
    title: "Cookies e armazenamento no navegador",
    body: [
      "Usamos apenas o que é necessário para o site funcionar:",
      [
        "Cookies de sessão, que mantêm você conectado à conta.",
        "Armazenamento local do navegador, que guarda sua escolha de tema claro ou escuro.",
      ],
      "Não usamos cookies de publicidade ou de rastreamento.",
    ],
  },
  {
    title: "Por quanto tempo guardamos",
    body: [
      "Guardamos seus dados enquanto sua conta existir. Ao excluir a conta, seu perfil e seu progresso são apagados do banco de dados.",
      "Registros técnicos e de envio de e-mail ficam com os prestadores pelo período que eles adotam, e alguns dados podem ser mantidos quando a lei exigir.",
    ],
  },
  {
    title: "Seus direitos",
    body: [
      "A LGPD garante a você, entre outros, os direitos de:",
      [
        "Confirmar se tratamos seus dados e ter acesso a eles.",
        "Corrigir dados incompletos, inexatos ou desatualizados.",
        "Pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários ou tratados em desacordo com a lei.",
        "Pedir a portabilidade dos dados.",
        "Saber com quem compartilhamos seus dados.",
        "Se opor a um tratamento e revisar ou retirar um consentimento, quando ele for a base legal.",
      ],
      `No Perfil, você mesmo pode alterar o nome e o avatar, apagar o progresso e excluir a conta. Para os demais pedidos, escreva para ${LEGAL_EMAIL}. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).`,
    ],
  },
  {
    title: "Crianças e adolescentes",
    body: [
      "O RoadCube é destinado a pessoas com 13 anos ou mais. Quem tem menos de 18 anos precisa da autorização de um responsável legal para criar uma conta.",
      `Se você é responsável e acredita que uma criança com menos de 13 anos criou uma conta, escreva para ${LEGAL_EMAIL} e a conta será excluída.`,
    ],
  },
  {
    title: "Segurança",
    body: [
      "Usamos conexão criptografada (HTTPS) e regras de acesso no banco de dados para que cada conta veja apenas os próprios dados. Nenhum sistema é totalmente seguro: se ocorrer um incidente com risco relevante, avisaremos as pessoas afetadas e a ANPD, conforme a lei.",
    ],
  },
  {
    title: "Mudanças nesta Política",
    body: [
      "Podemos atualizar esta Política quando o site mudar. A data no topo indica a versão atual e, se a mudança for importante, avisaremos pelo site ou por e-mail.",
    ],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "Sobre estes Termos",
    body: [
      `O RoadCube é um site para aprender a resolver o cubo mágico, mantido por ${LEGAL_OWNER}. Ao criar uma conta ou usar o site, você concorda com estes Termos e com a Política de Privacidade. Se não concordar, não use o RoadCube.`,
    ],
  },
  {
    title: "Quem pode usar",
    body: [
      "Você precisa ter 13 anos ou mais. Quem tem menos de 18 anos precisa da autorização de um responsável legal, que também responde pelo uso do site pelo adolescente.",
    ],
  },
  {
    title: "Sua conta",
    body: [
      [
        "Informe dados verdadeiros e mantenha seu e-mail atualizado.",
        "Guarde sua senha e não compartilhe sua conta.",
        "Você é responsável pelo que for feito na sua conta.",
        "Você pode excluir sua conta a qualquer momento, em Perfil → Configurações.",
      ],
    ],
  },
  {
    title: "Uso permitido",
    body: [
      "O RoadCube é para uso pessoal. Você concorda em não:",
      [
        "Tentar invadir, sobrecarregar ou prejudicar o site ou o acesso de outras pessoas.",
        "Burlar as regras de pontuação ou acessar dados de outras contas.",
        "Enviar como avatar conteúdo ilegal, ofensivo ou que viole direitos de terceiros.",
        "Copiar ou extrair o conteúdo do site em massa, ou usá-lo para criar um serviço concorrente.",
      ],
    ],
  },
  {
    title: "Conteúdo e propriedade",
    body: [
      "Os textos, a organização das lições, o visual, a marca e o código do RoadCube pertencem ao seu responsável ou aos seus licenciantes. Algoritmos e notações do cubo são conhecimento público da comunidade.",
      "O RoadCube é independente e não tem vínculo com a World Cube Association nem com fabricantes de cubos. Nomes e marcas de terceiros pertencem aos seus donos.",
    ],
  },
  {
    title: "Preço",
    body: [
      "Hoje o RoadCube é gratuito. Se recursos pagos forem criados, os preços e as condições serão informados com antecedência, e nenhuma cobrança será feita sem a sua aceitação.",
    ],
  },
  {
    title: "Disponibilidade e limites",
    body: [
      "O RoadCube está em evolução. Podemos mudar, suspender ou encerrar recursos, e o site pode ficar indisponível por manutenção ou falhas. Trabalhamos para preservar seu progresso, mas não garantimos funcionamento sem interrupções nem um resultado específico no aprendizado.",
      "Nada nestes Termos limita os direitos que a lei garante a você como consumidor.",
    ],
  },
  {
    title: "Suspensão e encerramento",
    body: [
      "Podemos suspender ou excluir contas que violem estes Termos ou a lei, avisando pelo e-mail cadastrado sempre que possível.",
    ],
  },
  {
    title: "Mudanças nestes Termos",
    body: [
      "Podemos atualizar estes Termos. A data no topo indica a versão atual e, se a mudança for importante, avisaremos pelo site ou por e-mail. Continuar usando o RoadCube depois do aviso significa aceitar a nova versão.",
    ],
  },
  {
    title: "Lei aplicável",
    body: [
      "Estes Termos seguem as leis do Brasil. Conflitos podem ser levados ao foro do seu domicílio, conforme o Código de Defesa do Consumidor.",
    ],
  },
];
