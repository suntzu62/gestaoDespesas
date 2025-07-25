import React from 'react';
import { 
  TrendingUp, 
  PieChart, 
  Target, 
  Smartphone, 
  CheckCircle, 
  Star,
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  Users,
  CreditCard,
  Bell,
  Download,
  Menu,
  X
} from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  rating: number;
}

interface CompetitorProps {
  name: string;
  price: string;
  features: string[];
  isHighlighted?: boolean;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">BolsoZen</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-green-600 transition-colors">Preços</a>
            <a href="#comparacao" className="text-gray-600 hover:text-green-600 transition-colors">Comparação</a>
            <a href="#contato" className="text-gray-600 hover:text-green-600 transition-colors">Contato</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <a href="/signin" className="text-gray-600 hover:text-green-600 transition-colors">Login</a>
            <a href="/signup" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Cadastre-se
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
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-2 space-y-2">
            <a href="#features" className="block py-2 text-gray-600">Features</a>
            <a href="#pricing" className="block py-2 text-gray-600">Preços</a>
            <a href="#comparacao" className="block py-2 text-gray-600">Comparação</a>
            <a href="#contato" className="block py-2 text-gray-600">Contato</a>
            <div className="border-t border-gray-100 pt-2 mt-2">
              <a href="/signin" className="block w-full text-left py-2 text-gray-600">Login</a>
              <a href="/signup" className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg mt-2 text-center">
                Cadastre-se
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Assuma o controle das suas
            <span className="text-green-600 block">finanças</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Centralize salários, gastos, metas e previsões de fluxo de caixa. 
            A gestão financeira inteligente que o Brasil precisa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup" className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
              Comece Grátis
              <ArrowRight className="w-5 h-5" />
            </a>
            <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors">
              Veja a Demo
            </button>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600">10k+</div>
            <div className="text-gray-600">Usuários ativos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">R$ 50M</div>
            <div className="text-gray-600">Gerenciados</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">150+</div>
            <div className="text-gray-600">Bancos conectados</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">4.8★</div>
            <div className="text-gray-600">Avaliação média</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Download className="w-6 h-6 text-green-600" />,
      title: "Importação Automática",
      description: "CSV, OFX, Pix e Open Finance. Conecte seus bancos e cartões automaticamente."
    },
    {
      icon: <Zap className="w-6 h-6 text-green-600" />,
      title: "IA para Categorização",
      description: "Categorização inteligente com machine learning e ajuste manual quando necessário."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-green-600" />,
      title: "Dashboard Intuitivo",
      description: "Gráficos mensais e anuais com visão clara do seu fluxo de caixa e padrões de gasto."
    },
    {
      icon: <Target className="w-6 h-6 text-green-600" />,
      title: "Metas Inteligentes",
      description: "Defina objetivos de economia e receba alertas quando se aproximar dos limites."
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Segurança Bancária",
      description: "Criptografia de ponta a ponta e conformidade com LGPD e regulamentações do Banco Central."
    },
    {
      icon: <Bell className="w-6 h-6 text-green-600" />,
      title: "Alertas Personalizados",
      description: "Notificações inteligentes sobre gastos, vencimentos e oportunidades de economia."
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tudo que você precisa para suas finanças
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ferramentas profissionais de gestão financeira adaptadas para o brasileiro
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

const Competitor: React.FC<CompetitorProps> = ({ name, price, features, isHighlighted }) => {
  return (
    <div className={`p-6 rounded-xl border-2 ${isHighlighted ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${isHighlighted ? 'text-green-700' : 'text-gray-900'}`}>
          {name}
        </h3>
        <span className={`text-lg font-semibold ${isHighlighted ? 'text-green-600' : 'text-gray-600'}`}>
          {price}
        </span>
      </div>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle className={`w-5 h-5 mt-0.5 ${isHighlighted ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ComparisonSection = () => {
  const competitors = [
    {
      name: "YNAB",
      price: "US$ 14,99/mês",
      features: [
        "Zero-based budgeting",
        "Educação financeira",
        "Metodologia robusta",
        "Mudança de hábitos"
      ]
    },
    {
      name: "BolsoZen",
      price: "R$ 19,90/mês",
      features: [
        "Open Finance brasileiro",
        "Categorização com IA",
        "Suporte em português",
        "Adaptado ao mercado BR",
        "Importação de Pix",
        "Compliance LGPD"
      ],
      isHighlighted: true
    },
    {
      name: "Monarch Money", 
      price: "US$ 99/ano",
      features: [
        "Dashboard compartilhado",
        "Colaboração familiar",
        "Flags de revisão",
        "Relatórios em grupo"
      ]
    },
    {
      name: "Quicken Simplifi",
      price: "US$ 2,99/mês",
      features: [
        "Interface simples",
        "Projeção fluxo de caixa",
        "Alertas em tempo real",
        "Relatórios básicos"
      ]
    }
  ];

  return (
    <section id="comparacao" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Por que escolher o BolsoZen?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare com as principais soluções do mercado mundial e veja por que somos a melhor opção para o Brasil
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {competitors.map((competitor, index) => (
            <Competitor key={index} {...competitor} />
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Planos transparentes e acessíveis
          </h2>
          <p className="text-xl text-gray-600">
            Comece grátis e evolua conforme suas necessidades
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">R$ 0</div>
              <div className="text-gray-600">Para sempre</div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Até 1.000 transações/mês</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>3 contas bancárias</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Categorização básica</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Relatórios mensais</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Suporte por email</span>
              </li>
            </ul>
            <a href="/signup" className="block w-full border-2 border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center">
              Começar Grátis
            </a>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-xl shadow-lg text-white relative">
            <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Mais Popular
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-1">R$ 19,90</div>
              <div className="text-green-100">por mês</div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-200" />
                <span>Transações ilimitadas</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-200" />
                <span>Contas bancárias ilimitadas</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-200" />
                <span>IA avançada para categorização</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-200" />
                <span>Relatórios personalizados</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-200" />
                <span>Alertas personalizados</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-200" />
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-200" />
                <span>Exportação de dados</span>
              </li>
            </ul>
            <a href="/signup" className="block w-full bg-white text-green-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center">
              Teste 30 Dias Grátis
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

const Testimonial: React.FC<TestimonialProps> = ({ name, role, content, rating }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <blockquote className="text-gray-700 mb-4">"{content}"</blockquote>
      <div>
        <div className="font-semibold text-gray-900">{name}</div>
        <div className="text-gray-600 text-sm">{role}</div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empresária, São Paulo",
      content: "O BolsoZen me ajudou a organizar minhas finanças pessoais e da empresa. A categorização automática é impressionante!",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Desenvolvedor, Rio de Janeiro",
      content: "Finalmente um app financeiro que entende o mercado brasileiro. A integração com Pix foi um diferencial.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Designer, Belo Horizonte",
      content: "Interface limpa e intuitiva. Consegui criar um controle de gastos que realmente funciona no meu dia a dia.",
      rating: 5
    }
  ];

  const trustLogos = [
    "TechCrunch", "Kiplinger", "Forbes", "Valor Econômico", "Estadão", "G1"
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mais de 10 mil usuários confiam no BolsoZen
          </h2>
          <p className="text-xl text-gray-600">
            Veja o que nossos usuários dizem sobre a plataforma
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>

        <div className="text-center">
          <div className="text-gray-500 mb-8">Reconhecido por:</div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-60">
            {trustLogos.map((logo, index) => (
              <div key={index} className="text-gray-400 font-semibold text-center">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer id="contato" className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">BolsoZen</span>
            </div>
            <p className="text-gray-400 mb-4">
              A gestão financeira inteligente que o Brasil precisa.
            </p>
            <div className="flex space-x-4">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">10k+ usuários ativos</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Produto</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Preços</a></li>
              <li><a href="#comparacao" className="text-gray-400 hover:text-white transition-colors">Comparação</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sobre</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Carreiras</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Imprensa</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0">
              © 2025 BolsoZen. Todos os direitos reservados.
            </div>
            <div className="flex space-x-4">
              <a href="/signin" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Login
              </a>
              <a href="/signup" className="border border-green-600 text-green-400 px-6 py-2 rounded-lg hover:bg-green-600 hover:text-white transition-colors">
                Cadastre-se
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ComparisonSection />
      <PricingSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}

export default App;