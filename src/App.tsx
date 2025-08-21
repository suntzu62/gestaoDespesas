import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { HeroSection } from './components/HeroSection';
import { InteractiveDemoSection } from './components/InteractiveDemoSection';
import { BudgetSimulator } from './components/BudgetSimulator';
import { EducationalResourcesSection } from './components/EducationalResourcesSection';
import { 
  TrendingUp, 
  PieChart, 
  Target, 
  Shield, 
  Zap,
  BarChart3,
  Bell,
  Download,
  Menu,
  X,
  CheckCircle, 
  Star,
  ArrowRight,
  Users,
  Bot,
  Smartphone,
  Globe,
  Award,
  MessageCircle
} from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
  verified?: boolean;
}

interface CompetitorProps {
  name: string;
  price: string;
  features: string[];
  isHighlighted?: boolean;
  badge?: string;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">BolsoZen</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Recursos</a>
            <a href="#demo" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Demo</a>
            <a href="#pricing" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Preços</a>
            <a href="#education" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Academia</a>
            <a href="#comparacao" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Comparação</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <a href="/signin" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Login</a>
            <a href="/signup" className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
              Comece Grátis
            </a>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-2 space-y-2">
            <a href="#features" className="block py-3 text-gray-600 font-medium">Recursos</a>
            <a href="#demo" className="block py-3 text-gray-600 font-medium">Demo</a>
            <a href="#pricing" className="block py-3 text-gray-600 font-medium">Preços</a>
            <a href="#education" className="block py-3 text-gray-600 font-medium">Academia</a>
            <a href="#comparacao" className="block py-3 text-gray-600 font-medium">Comparação</a>
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              <a href="/signin" className="block py-3 text-gray-600 font-medium">Login</a>
              <a href="/signup" className="block w-full bg-green-600 text-white px-4 py-3 rounded-xl text-center font-semibold">
                Comece Grátis
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const Feature: React.FC<FeatureProps> = ({ icon, title, description, highlight = false }) => {
  return (
    <div className={`relative p-8 rounded-2xl transition-all hover:shadow-lg group cursor-pointer ${
      highlight 
        ? 'bg-gradient-to-br from-green-500 to-blue-600 text-white shadow-xl' 
        : 'bg-white border border-gray-100 hover:border-green-200'
    }`}>
      {highlight && (
        <div className="absolute -top-3 left-8 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Exclusivo BR
        </div>
      )}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
        highlight ? 'bg-white/20' : 'bg-green-100'
      }`}>
        <div className={highlight ? 'text-white' : 'text-green-600'}>
          {icon}
        </div>
      </div>
      <h3 className={`text-xl font-bold mb-3 ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`leading-relaxed ${highlight ? 'text-green-100' : 'text-gray-600'}`}>
        {description}
      </p>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: "Orçamento Base Zero",
      description: "Aloque cada centavo da sua renda. O método que revolucionou o controle financeiro mundial, adaptado para brasileiros.",
      highlight: false
    },
    {
      icon: <Smartphone className="w-7 h-7" />,
      title: "Integração Pix + Open Finance",
      description: "Conecte suas contas, importe transações Pix automaticamente e mantenha tudo sincronizado em tempo real.",
      highlight: true
    },
    {
      icon: <Bot className="w-7 h-7" />,
      title: "IA Brasileira Avançada",
      description: "Categorização inteligente que entende gastos típicos do Brasil: iFood, Uber, 99, farmácias e muito mais.",
      highlight: false
    },
    {
      icon: <Target className="w-7 h-7" />,
      title: "Metas Inteligentes",
      description: "Defina objetivos realistas de economia e investimento. Receba insights personalizados para acelerar seus resultados.",
      highlight: false
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Segurança Bancária",
      description: "Criptografia de ponta a ponta, compliance LGPD e conformidade com regulamentações do Banco Central.",
      highlight: false
    },
    {
      icon: <Bell className="w-7 h-7" />,
      title: "Alertas Inteligentes",
      description: "Notificações personalizadas sobre gastos, vencimentos e oportunidades de economia que realmente importam.",
      highlight: false
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tudo que você precisa para
            <span className="block text-green-600">dominar suas finanças</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Recursos profissionais de gestão financeira, adaptados especificamente 
            para a realidade e necessidades dos brasileiros.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonial: React.FC<TestimonialProps> = ({ name, role, content, rating, avatar, verified }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-1 mb-6">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
        "{content}"
      </blockquote>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="font-semibold text-gray-900">{name}</div>
            {verified && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
          <div className="text-gray-600 text-sm">{role}</div>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Ana Carolina Silva",
      role: "Arquiteta, São Paulo",
      content: "Em 6 meses usando o BolsoZen, consegui quitar R$ 8.000 em dívidas e ainda formar uma reserva de emergência. A IA realmente entende meus gastos brasileiros!",
      rating: 5,
      verified: true
    },
    {
      name: "Carlos Mendes",
      role: "Desenvolvedor, Rio de Janeiro",
      content: "Finalmente um app que conecta direto com o Pix! A categorização automática do iFood, Uber e 99 me economiza horas todo mês. Melhor investimento que fiz.",
      rating: 5,
      verified: true
    },
    {
      name: "Juliana Costa",
      role: "Consultora, Belo Horizonte",
      content: "Testei YNAB, Mint e outros apps gringos. O BolsoZen é o único que realmente entende como a gente gasta no Brasil. Interface linda e suporte em português!",
      rating: 5,
      verified: true
    }
  ];

  const trustLogos = [
    { name: "Valor Econômico", description: "Melhor App Financeiro 2024" },
    { name: "Exame", description: "Startup Promissora" },
    { name: "Estadão", description: "Inovação Fintech" },
    { name: "TechCrunch", description: "Rising Star" },
    { name: "G1", description: "Destaque Tecnologia" },
    { name: "Folha", description: "App Recomendado" }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            +50.000 brasileiros já transformaram suas vidas
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Veja os resultados reais que nossos usuários estão alcançando com o BolsoZen
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">R$ 50M</div>
            <div className="text-gray-600">Economia total dos usuários</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">89%</div>
            <div className="text-gray-600">Atingem suas metas</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">6x</div>
            <div className="text-gray-600">Mais economia média</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">4.9★</div>
            <div className="text-gray-600">Avaliação nas lojas</div>
          </div>
        </div>

        {/* Media Recognition */}
        <div className="text-center">
          <div className="text-gray-500 text-lg font-medium mb-8">Reconhecido por:</div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center">
            {trustLogos.map((logo, index) => (
              <div key={index} className="text-center">
                <div className="text-gray-400 font-bold text-lg mb-1">{logo.name}</div>
                <div className="text-xs text-gray-400">{logo.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Competitor: React.FC<CompetitorProps> = ({ name, price, features, isHighlighted, badge }) => {
  return (
    <div className={`relative p-8 rounded-2xl border-2 transition-all ${
      isHighlighted 
        ? 'border-green-500 bg-green-50 shadow-xl transform scale-105' 
        : 'border-gray-200 bg-white hover:border-green-300'
    }`}>
      {badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
          {badge}
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${isHighlighted ? 'text-green-700' : 'text-gray-900'}`}>
          {name}
        </h3>
        <div className={`text-3xl font-bold ${isHighlighted ? 'text-green-600' : 'text-gray-600'}`}>
          {price}
        </div>
        <div className="text-gray-500 text-sm mt-1">por mês</div>
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              isHighlighted ? 'text-green-500' : 'text-gray-400'
            }`} />
            <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
      
      {isHighlighted && (
        <button className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors">
          Escolher BolsoZen
        </button>
      )}
    </div>
  );
};

const ComparisonSection = () => {
  const competitors = [
    {
      name: "YNAB",
      price: "US$ 14,99",
      features: [
        "Orçamento base zero clássico",
        "Educação financeira robusta",
        "Metodologia comprovada",
        "Comunidade ativa",
        "❌ Sem integração Pix",
        "❌ Interface em inglês",
        "❌ Suporte limitado no Brasil"
      ]
    },
    {
      name: "BolsoZen",
      price: "R$ 19,90",
      features: [
        "Orçamento base zero adaptado ao BR",
        "IA treinada para gastos brasileiros",
        "Integração nativa Pix + Open Finance", 
        "Suporte completo em português",
        "Compliance LGPD total",
        "Categorias típicas brasileiras",
        "Preço justo em reais",
        "Suporte local especializado"
      ],
      isHighlighted: true,
      badge: "Feito para o Brasil"
    },
    {
      name: "Monarch Money", 
      price: "US$ 99",
      features: [
        "Dashboard colaborativo",
        "Relatórios familiares",
        "Sincronização automática",
        "Interface moderna",
        "❌ Caríssimo para brasileiros",
        "❌ Sem integração com bancos BR",
        "❌ Suporte apenas em inglês"
      ]
    },
    {
      name: "Quicken Simplifi",
      price: "US$ 5,99",
      features: [
        "Interface simplificada",
        "Projeções de fluxo de caixa",
        "Alertas básicos em tempo real",
        "Relatórios automáticos",
        "❌ Funcionalidades limitadas",
        "❌ Sem recursos avançados",
        "❌ Não entende mercado BR"
      ]
    }
  ];

  return (
    <section id="comparacao" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Por que BolsoZen é a escolha certa?
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Compare com as principais soluções mundiais e veja por que somos 
            a melhor opção para brasileiros que querem controle financeiro real.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {competitors.map((competitor, index) => (
            <Competitor key={index} {...competitor} />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 border border-green-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Não é só questão de preço</h3>
            <p className="text-gray-600 mb-6">
              É sobre ter uma ferramenta que realmente entende como você gasta, 
              onde você gasta e quais são suas metas financeiras como brasileiro.
            </p>
            <button className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors">
              Experimente 30 Dias Grátis
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Planos transparentes e justos
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Comece grátis e evolua conforme suas necessidades. Sem pegadinhas, sem taxas ocultas.
          </p>
          <div className="inline-flex bg-green-100 rounded-full p-1">
            <button className="bg-white text-green-600 px-6 py-2 rounded-full font-semibold shadow-sm">
              Mensal
            </button>
            <button className="text-green-600 px-6 py-2 rounded-full font-semibold">
              Anual <span className="text-sm">(2 meses grátis)</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-gray-50 p-10 rounded-2xl border border-gray-200">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gratuito</h3>
              <div className="text-5xl font-bold text-gray-900 mb-2">R$ 0</div>
              <div className="text-gray-600">Para sempre</div>
            </div>
            
            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium">Até 1.000 transações/mês</span>
                  <div className="text-sm text-gray-600">Perfeito para começar</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium">3 contas bancárias</span>
                  <div className="text-sm text-gray-600">Conta corrente, poupança e cartão</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span>Orçamento base zero básico</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span>Categorização manual</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span>Relatórios mensais</span>
              </li>
            </ul>
            
            <a href="/signup" className="block w-full border-2 border-green-600 text-green-600 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors text-center">
              Começar Gratuitamente
            </a>
          </div>
          
          {/* Pro Plan */}
          <div className="relative bg-gradient-to-br from-green-600 to-blue-600 p-10 rounded-2xl shadow-2xl text-white">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold">
              Mais Popular - 89% escolhem
            </div>
            
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold mb-4">BolsoZen Pro</h3>
              <div className="text-5xl font-bold mb-2">R$ 19,90</div>
              <div className="text-green-100">por mês</div>
            </div>
            
            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-200 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium">Transações ilimitadas</span>
                  <div className="text-sm text-green-100">Para quem usa muito cartão/Pix</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-200 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium">Contas ilimitadas</span>
                  <div className="text-sm text-green-100">Todos os seus bancos e cartões</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-200 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium">IA avançada brasileira</span>
                  <div className="text-sm text-green-100">Reconhece iFood, Uber, farmácias</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-200 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium">Integração Pix + Open Finance</span>
                  <div className="text-sm text-green-100">Importação automática</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-200 flex-shrink-0 mt-1" />
                <span>Metas inteligentes e alertas</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-200 flex-shrink-0 mt-1" />
                <span>Relatórios avançados e insights</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-200 flex-shrink-0 mt-1" />
                <span>Suporte prioritário via WhatsApp</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-200 flex-shrink-0 mt-1" />
                <span>Exportação completa de dados</span>
              </li>
            </ul>
            
            <a href="/signup" className="block w-full bg-white text-green-600 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors text-center mb-4">
              Teste 30 Dias Grátis
            </a>
            <p className="text-center text-green-100 text-sm">
              Cancele quando quiser • Sem fidelidade • Dados sempre seus
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Garantia total de 30 dias</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Experimente todos os recursos Pro sem compromisso. Se não ficar completamente 
            satisfeito, devolvemos 100% do seu dinheiro, sem perguntas.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Pagamento seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <span>+50k usuários satisfeitos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">BolsoZen</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              A primeira plataforma de gestão financeira verdadeiramente brasileira. 
              Orçamento base zero, IA em português e integração completa com o ecossistema financeiro nacional.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="sr-only">Instagram</span>
                📱
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="sr-only">LinkedIn</span>
                💼
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="sr-only">YouTube</span>
                📺
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Produto</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Recursos</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Preços</a></li>
              <li><a href="#demo" className="text-gray-400 hover:text-white transition-colors">Demo Interativa</a></li>
              <li><a href="/api-docs" className="text-gray-400 hover:text-white transition-colors">API Developers</a></li>
              <li><a href="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrações</a></li>
              <li><a href="/security" className="text-gray-400 hover:text-white transition-colors">Segurança</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Empresa</h3>
            <ul className="space-y-3">
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="/careers" className="text-gray-400 hover:text-white transition-colors">Carreiras</a></li>
              <li><a href="/press" className="text-gray-400 hover:text-white transition-colors">Imprensa</a></li>
              <li><a href="/partners" className="text-gray-400 hover:text-white transition-colors">Parceiros</a></li>
              <li><a href="/investors" className="text-gray-400 hover:text-white transition-colors">Investidores</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Suporte</h3>
            <ul className="space-y-3">
              <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
              <li><a href="/whatsapp" className="text-gray-400 hover:text-white transition-colors">WhatsApp</a></li>
              <li><a href="/status" className="text-gray-400 hover:text-white transition-colors">Status da Plataforma</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Política de Privacidade</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-6 md:mb-0">
              © 2025 BolsoZen. Todos os direitos reservados. CNPJ: XX.XXX.XXX/0001-XX
            </div>
            <div className="flex space-x-6">
              <a href="/signup" className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold">
                Comece Grátis
              </a>
              <a href="/signin" className="border border-green-600 text-green-400 px-6 py-3 rounded-xl hover:bg-green-600 hover:text-white transition-colors font-semibold">
                Fazer Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Chat Widget Component
const ChatWidget = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 h-96 mb-4 border border-gray-200 flex flex-col">
          <div className="bg-green-600 text-white p-4 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Assistente BolsoZen</h3>
                <p className="text-green-100 text-sm">Como posso ajudar?</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-green-100 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                <p className="text-sm">Olá! Sou a IA do BolsoZen. Posso te ajudar com dúvidas sobre orçamento, recursos ou preços. O que gostaria de saber?</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button className="text-left text-sm p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  💰 Como funciona o orçamento base zero?
                </button>
                <button className="text-left text-sm p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  🤖 A IA realmente entende gastos brasileiros?
                </button>
                <button className="text-left text-sm p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  💳 Como conectar minha conta bancária?
                </button>
                <button className="text-left text-sm p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  📞 Falar com um humano
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 border-t">
            <input
              type="text"
              placeholder="Digite sua pergunta..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-600 text-white w-14 h-14 rounded-full shadow-2xl hover:bg-green-700 transition-colors flex items-center justify-center hover:scale-105 transform"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <div id="demo">
        <InteractiveDemoSection />
      </div>
      <FeaturesSection />
      <BudgetSimulator />
      <ComparisonSection />
      <PricingSection />
      <TestimonialsSection />
      <div id="education">
        <EducationalResourcesSection />
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default App;