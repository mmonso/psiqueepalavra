'use client';

import { useState } from 'react';
import { CornerDownRight, HelpCircle, Lightbulb, Sparkles } from 'lucide-react';
import { criarAnotacao } from '@/lib/reader-storage';

const ATALHOS = [
  {
    id: 'pergunta',
    icone: HelpCircle,
    titulo: 'Pergunta socrática',
    descricao: 'Que questão este ensaio faz ecoar no meu cotidiano?',
    pedido:
      'Gere uma pergunta provocativa, no estilo socrático, que me leve a refletir sobre o tema central deste ensaio na minha própria vida.',
  },
  {
    id: 'conexao',
    icone: Lightbulb,
    titulo: 'Conexão psicanalítica',
    descricao: 'Como o tema dialoga com os grandes pensadores da mente?',
    pedido:
      'Faça uma síntese conectando as ideias deste texto com a psicanálise de Winnicott, Frankl ou Jung, explicando a relevância clínica do tema.',
  },
  {
    id: 'pratica',
    icone: CornerDownRight,
    titulo: 'Prática de auto-escuta',
    descricao: 'Caminhos para abrandar a autocobrança e acolher o silêncio.',
    pedido:
      'Sugira três exercícios de auto-escuta que ajudem a acolher a vulnerabilidade e a afrouxar o imperativo do desempenho no dia a dia.',
  },
] as const;

interface Props {
  slug: string;
  titulo: string;
  /** Falso quando a GEMINI_API_KEY não está configurada no servidor. */
  disponivel: boolean;
}

export function SocraticDialog({ slug, titulo, disponivel }: Props) {
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const consultar = async (pedido: string) => {
    if (!pedido.trim() || carregando) return;
    setCarregando(true);
    setResposta(null);
    setErro(null);
    setSalvo(false);

    try {
      const resposta = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, pedido }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados?.erro || 'Falha na consulta.');
      setResposta(dados.reflexao);
    } catch {
      setErro(
        'Não foi possível consultar o assistente agora. Talvez seja um bom momento para escrever uma anotação sua: que emoção ou lembrança este ensaio despertou?',
      );
    } finally {
      setCarregando(false);
    }
  };

  const salvarNasAnotacoes = () => {
    if (!resposta) return;
    criarAnotacao({ slug, citacao: 'Reflexão do assistente socrático', texto: resposta });
    setSalvo(true);
  };

  return (
    <section className="anim-aparecer">
      <div className="mb-8 rounded-2xl border border-line bg-card p-6 sm:p-8">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold">Diálogo socrático</h2>
            <p className="text-sm text-muted">
              Uma provocação gerada por inteligência artificial para aprofundar os conceitos
              deste ensaio na sua experiência.
            </p>
          </div>
        </div>

        {/*
          O leitor precisa saber que é uma máquina respondendo, que o texto vai
          para um serviço externo e que isso não é atendimento psicológico.
        */}
        <p className="mb-6 rounded-lg border border-line bg-canvas p-4 text-xs leading-relaxed text-muted">
          <strong className="font-semibold text-ink">Antes de começar:</strong> as respostas são
          geradas por um modelo de linguagem (Google Gemini), podem conter erros e{' '}
          <strong className="font-semibold text-ink">
            não são atendimento psicológico, diagnóstico ou orientação clínica
          </strong>
          . O que você escrever aqui é enviado ao serviço do Google para gerar a resposta —
          por isso, não compartilhe dados pessoais ou informações de saúde. Nada é gravado
          neste site.
        </p>

        {!disponivel ? (
          <p className="rounded-lg border border-line bg-canvas p-4 text-sm text-muted">
            O diálogo com IA está temporariamente indisponível. Os ensaios e as anotações
            continuam funcionando normalmente.
          </p>
        ) : (
          <>
            <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {ATALHOS.map((atalho) => {
                const Icone = atalho.icone;
                return (
                  <button
                    key={atalho.id}
                    type="button"
                    disabled={carregando}
                    onClick={() => consultar(atalho.pedido)}
                    className="flex flex-col justify-between gap-2 rounded-xl border border-line bg-canvas p-4 text-left transition-colors hover:border-accent disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Icone className="h-4 w-4 text-accent" aria-hidden="true" />
                      {atalho.titulo}
                    </span>
                    <span className="text-xs text-muted">{atalho.descricao}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-line pt-6">
              <label
                htmlFor="pergunta-livre"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Ou faça uma pergunta sobre o ensaio
              </label>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  consultar(pergunta);
                  setPergunta('');
                }}
              >
                <input
                  id="pergunta-livre"
                  type="text"
                  value={pergunta}
                  maxLength={500}
                  onChange={(e) => setPergunta(e.target.value)}
                  placeholder="Ex.: por que o silêncio incomoda tanto?"
                  className="flex-1 rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="submit"
                  disabled={carregando || !pergunta.trim()}
                  className="rounded-lg bg-btn px-5 py-2.5 text-sm font-medium text-btn-ink transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {carregando ? 'Refletindo…' : 'Consultar'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      <div aria-live="polite">
        {carregando && (
          <p className="rounded-2xl border border-line bg-card p-8 text-center font-serif italic">
            Tecendo uma reflexão sobre &ldquo;{titulo}&rdquo;…
          </p>
        )}

        {erro && !carregando && (
          <p className="rounded-2xl border border-line bg-card p-8 text-center font-serif italic text-muted">
            {erro}
          </p>
        )}

        {resposta && !carregando && (
          <div className="anim-surgir rounded-2xl border-2 border-accent/40 bg-card p-8 sm:p-10">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Reflexão gerada por IA
            </p>
            <div className="whitespace-pre-wrap font-serif text-base leading-relaxed sm:text-lg">
              {resposta}
            </div>
            <div className="mt-8 flex justify-end border-t border-line pt-4">
              <button
                type="button"
                onClick={salvarNasAnotacoes}
                disabled={salvo}
                className="text-xs font-semibold underline decoration-1 underline-offset-4 transition-opacity hover:opacity-80 disabled:no-underline disabled:opacity-60"
              >
                {salvo ? 'Salva nas suas anotações' : '+ Salvar nas minhas anotações'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
