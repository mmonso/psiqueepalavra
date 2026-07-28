import type { Metadata } from 'next';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacidade e uso de dados',
  description:
    'Como este site trata os dados de quem o visita: o que fica no seu navegador, o que é enviado a terceiros e o que não é coletado.',
  alternates: { canonical: '/privacidade' },
};

export default function Privacidade() {
  return (
    <main className="coluna-leitura mx-auto w-full px-4 py-12 sm:px-6 sm:py-20">
      <h1 className="mb-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Privacidade e uso de dados
      </h1>
      <p className="mb-12 font-serif text-lg italic text-muted">
        Em resumo: este site não tem cadastro, não tem login e não guarda nada sobre você em
        servidor nenhum.
      </p>

      <div className="markdown leitura">
        <h2>O que fica no seu navegador</h2>
        <p>
          Suas preferências de leitura (tema, fonte, tamanho do texto), seus ensaios favoritos
          e suas anotações são gravados no <em>localStorage</em> do navegador que você está
          usando. Esses dados não saem do seu aparelho e não são acessíveis por{' '}
          {site.autor} nem por terceiros.
        </p>
        <p>
          Como consequência, eles são específicos daquele navegador: não aparecem em outro
          aparelho e são perdidos se você limpar os dados de navegação. Se quiser guardá-los,
          use a exportação disponível na página de favoritos.
        </p>

        <h2>O diálogo socrático com inteligência artificial</h2>
        <p>
          Quando você usa o recurso de diálogo, o texto que você escreve é enviado ao serviço{' '}
          <strong>Google Gemini</strong> para gerar a resposta, junto com um trecho do ensaio
          que você está lendo. Esse envio é necessário para o recurso funcionar e está sujeito
          às políticas de privacidade do Google.
        </p>
        <p>
          Este site <strong>não grava</strong> as perguntas nem as respostas. Ainda assim,
          recomendamos não escrever informações pessoais, dados de saúde ou qualquer coisa que
          identifique você ou outra pessoa. O recurso é opcional: o site funciona por inteiro
          sem ele.
        </p>
        <p>
          As respostas são geradas por uma máquina, podem conter erros e não constituem
          atendimento psicológico, diagnóstico ou orientação clínica.
        </p>

        <h2>O que não é coletado</h2>
        <ul>
          <li>Não há cadastro, login ou formulário de contato.</li>
          <li>Não há cookies de rastreamento nem publicidade.</li>
          <li>
            As fontes tipográficas são servidas por este próprio domínio, e não pelo CDN do
            Google — seu navegador não faz requisição a terceiros para carregá-las.
          </li>
        </ul>

        <h2>Hospedagem</h2>
        <p>
          O site é hospedado pela Vercel, que registra dados técnicos de acesso (como endereço
          IP e tipo de navegador) para operar e proteger a infraestrutura, conforme a política
          de privacidade dela.
        </p>

        <h2>Seus direitos</h2>
        <p>
          A Lei Geral de Proteção de Dados garante a você direitos sobre seus dados pessoais.
          Como este site não armazena dados pessoais em servidor, o controle está com você:
          apagar os dados do navegador remove tudo que foi guardado. Para dúvidas sobre esta
          política, entre em contato com {site.autor}.
        </p>
      </div>
    </main>
  );
}
