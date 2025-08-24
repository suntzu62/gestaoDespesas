@@ .. @@
-import React from 'react';
-import { 
-  TrendingUp, 
-  PieChart, 
-  Target, 
-  Shield, 
-  Zap,
-  BarChart3,
-  Bell,
-  Download,
-  Menu,
-  X,
-  CheckCircle, 
-  Star,
-  ArrowRight,
-  Users,
-  Bot,
-  Smartphone,
-  Globe,
-  Award,
-  MessageCircle
-} from 'lucide-react';
+import React from 'react';
+import { Inbox, FileText, CreditCard, ArrowRight, Zap, Clock, Shield, CheckCircle } from 'lucide-react';
+import { trackEvent } from '../utils/telemetry';
 
-interface FeatureProps {
-  icon: React.ReactNode;
-  title: string;
-  description: string;
-  highlight?: boolean;
-}
-
-const Feature: React.FC<FeatureProps> = ({ icon, title, description, highlight = false }) => {
-  return (
-    <div className={`relative p-8 rounded-2xl transition-all hover:shadow-lg group cursor-pointer ${
-      highlight 
-        ? 'bg-gradient-to-br from-green-500 to-blue-600 text-white shadow-xl' 
-        : 'bg-white border border-gray-100 hover:border-green-200'
-    }`}>
-      {highlight && (
-        <div className="absolute -top-3 left-8 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
-          Exclusivo BR
-        </div>
-      )}
-      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
-        highlight ? 'bg-white/20' : 'bg-green-100'
-      }`}>
-        <div className={highlight ? 'text-white' : 'text-green-600'}>
-          {icon}
-        </div>
-      </div>
-      <h3 className={`text-xl font-bold mb-3 ${highlight ? 'text-white' : 'text-gray-900'}`}>
-        {title}
-      </h3>
-      <p className={`leading-relaxed ${highlight ? 'text-green-100' : 'text-gray-600'}`}>
-        {description}
-      </p>
-    </div>
-  );
-};
-
-const FeaturesSection = () => {
+export const FeaturesSection = () => {
+  const handleCTAClick = (source: string) => {
+    trackEvent('cta_click', { source: 'features', location: source });
+  };
+  
   const features = [
     {
-      icon: <BarChart3 className="w-7 h-7" />,
-      title: "Orçamento Base Zero",
-      description: "Aloque cada centavo da sua renda. O método que revolucionou o controle financeiro mundial, adaptado para brasileiros.",
-      highlight: false
+      icon: <Inbox className="w-8 h-8" />,
+      title: "Zero digitação no dia a dia",
+      description: "Smart Inbox captura boletos do email automaticamente. Gastos no cartão e Pix chegam sozinhos. Você só revisa e confirma.",
+      badge: "Smart Inbox",
+      metrics: "87% menos tempo digitando",
+      color: "from-green-500 to-green-600"
     },
     {
-      icon: <Smartphone className="w-7 h-7" />,
-      title: "Integração Pix + Open Finance",
-      description: "Conecte suas contas, importe transações Pix automaticamente e mantenha tudo sincronizado em tempo real.",
-      highlight: true
+      icon: <FileText className="w-8 h-8" />,
+      title: "Contas que chegam sozinhas",
+      description: "DDA (Débito Direto Autorizado) integrado. Boletos de luz, água, cartão chegam automaticamente no app. Sem surpresas.",
+      badge: "DDA",
+      metrics: "100% dos boletos cobertos",
+      color: "from-blue-500 to-blue-600"
     },
     {
-      icon: <Bot className="w-7 h-7" />,
-      title: "IA Brasileira Avançada",
-      description: "Categorização inteligente que entende gastos típicos do Brasil: iFood, Uber, 99, farmácias e muito mais.",
-      highlight: false
-    },
-    {
-      icon: <Target className="w-7 h-7" />,
-      title: "Metas Inteligentes",
-      description: "Defina objetivos realistas de economia e investimento. Receba insights personalizados para acelerar seus resultados.",
-      highlight: false
-    },
-    {
-      icon: <Shield className="w-7 h-7" />,
-      title: "Segurança Bancária",
-      description: "Criptografia de ponta a ponta, compliance LGPD e conformidade com regulamentações do Banco Central.",
-      highlight: false
-    },
-    {
-      icon: <Bell className="w-7 h-7" />,
-      title: "Alertas Inteligentes",
-      description: "Notificações personalizadas sobre gastos, vencimentos e oportunidades de economia que realmente importam.",
-      highlight: false
+      icon: <CreditCard className="w-8 h-8" />,
+      title: "Pagamentos no app",
+      description: "Em breve: Pague suas contas direto no BolsoZen via Pix/Open Finance. Orçamento e pagamento integrados numa ferramenta só.",
+      badge: "Em desenvolvimento",
+      metrics: "Roadmap Q2 2025",
+      color: "from-purple-500 to-purple-600",
+      isRoadmap: true
     }
   ];

@@ -81,20 +35,84 @@

   return (
-    <section id="features" className="py-24 bg-gray-50">
+    <section id="beneficios" className="py-20 bg-gray-50">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-20">
           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
-            Tudo que você precisa para
-            <span className="block text-green-600">dominar suas finanças</span>
+            Automação financeira que funciona
+            <span className="block text-green-600">para o seu dia a dia</span>
           </h2>
           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
-            Recursos profissionais de gestão financeira, adaptados especificamente 
-            para a realidade e necessidades dos brasileiros.
+            Pare de perder tempo digitando gastos. O BolsoZen automatiza a captura 
+            e você foca no que importa: suas metas financeiras.
           </p>
         </div>
         
-        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
-          {features.map((feature, index) => (
-            <Feature key={index} {...feature} />
+        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
+          {features.map((feature, index) => (
+            <div 
+              key={index}
+              className={`relative p-8 rounded-2xl transition-all hover:shadow-xl group cursor-pointer ${
+                feature.isRoadmap 
+                  ? 'bg-white border-2 border-dashed border-purple-300 hover:border-purple-500' 
+                  : 'bg-white border border-gray-100 hover:border-green-200'
+              }`}
+            >
+              {/* Badge */}
+              <div className={`absolute -top-3 left-8 px-3 py-1 rounded-full text-xs font-semibold ${
+                feature.isRoadmap 
+                  ? 'bg-purple-100 text-purple-700'
+                  : 'bg-green-100 text-green-700'
+              }`}>
+                {feature.badge}
+              </div>
+              
+              {/* Icon */}
+              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-gradient-to-br ${feature.color}`}>
+                <div className="text-white">
+                  {feature.icon}
+                </div>
+              </div>
+              
+              {/* Content */}
+              <h3 className="text-xl font-bold mb-4 text-gray-900">
+                {feature.title}
+              </h3>
+              
+              <p className="text-gray-600 leading-relaxed mb-6">
+                {feature.description}
+              </p>
+              
+              {/* Metrics */}
+              <div className={`flex items-center gap-2 text-sm font-medium ${
+                feature.isRoadmap ? 'text-purple-600' : 'text-green-600'
+              }`}>
+                <Zap className="w-4 h-4" />
+                {feature.metrics}
+              </div>
+              
+              {/* Additional benefits for non-roadmap items */}
+              {!feature.isRoadmap && (
+                <div className="mt-4 space-y-2">
+                  <div className="flex items-center gap-2 text-sm text-gray-500">
+                    <Clock className="w-4 h-4" />
+                    <span>Economia de tempo diária</span>
+                  </div>
+                  <div className="flex items-center gap-2 text-sm text-gray-500">
+                    <Shield className="w-4 h-4" />
+                    <span>100% seguro e auditável</span>
+                  </div>
+                </div>
+              )}
+            </div>
           ))}
         </div>
+        
+        {/* Bottom CTA */}
+        <div className="text-center">
+          <button
+            onClick={() => handleCTAClick('features-bottom')}
+            className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
+          >
+            Experimentar automação grátis
+            <ArrowRight className="w-4 h-4" />
+          </button>
+        </div>
       </div>
     </section>
   );
-};