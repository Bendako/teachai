"use client";

import { Button } from "./ui/button";
import { useState } from "react";
import { SignUpButton } from "@clerk/nextjs";

export function LandingPage() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: "Starter",
      price: selectedPlan === 'monthly' ? 29 : 290,
      period: selectedPlan === 'monthly' ? 'month' : 'year',
      description: "Perfect for individual teachers getting started",
      features: [
        "Up to 10 students",
        "AI lesson planning (50/month)",
        "Basic progress tracking",
        "Email support",
        "Mobile responsive",
        "Lesson templates"
      ],
      popular: false,
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      price: selectedPlan === 'monthly' ? 79 : 790,
      period: selectedPlan === 'monthly' ? 'month' : 'year',
      description: "Ideal for growing teaching businesses",
      features: [
        "Up to 50 students",
        "Unlimited AI lesson planning",
        "Advanced analytics & reports",
        "Parent communication portal",
        "Priority support",
        "Custom lesson templates",
        "Progress assessments",
        "Calendar integration"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: selectedPlan === 'monthly' ? 199 : 1990,
      period: selectedPlan === 'monthly' ? 'month' : 'year',
      description: "For schools and large teaching organizations",
      features: [
        "Unlimited students",
        "Everything in Professional",
        "Multi-teacher support",
        "Advanced reporting & analytics",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "White-label options"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              AI-Powered English Teaching Platform
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Transform Your
              <span className="block bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#6366F1] bg-clip-text text-transparent">
                English Teaching
              </span>
              with AI
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create personalized lesson plans, track student progress, and automate communication 
              with our intelligent teaching assistant designed specifically for English teachers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <SignUpButton>
                <Button size="lg" className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5855EB] hover:to-[#7C3AED] text-white px-8 py-4 text-lg font-semibold shadow-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                  Start Free 14-Day Trial
                </Button>
              </SignUpButton>
              <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cancel anytime
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Setup in 5 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to teach effectively
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed specifically for English teachers to save time and improve student outcomes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon="brain"
              title="AI Lesson Planning"
              description="Generate personalized lesson plans in seconds using advanced AI that understands your students' needs and learning styles."
            />
            <FeatureCard 
              icon="chart-line"
              title="Progress Analytics"
              description="Track student progress with detailed analytics, identify learning gaps, and celebrate achievements with visual reports."
            />
            <FeatureCard 
              icon="users"
              title="Student Management"
              description="Manage all your students in one place with detailed profiles, parent communication, and scheduling tools."
            />
            <FeatureCard 
              icon="message-circle"
              title="Automated Communication"
              description="Send lesson summaries, progress reports, and updates to parents automatically, saving hours each week."
            />
            <FeatureCard 
              icon="calendar"
              title="Smart Scheduling"
              description="Intelligent lesson scheduling that considers student availability, teacher preferences, and optimal learning times."
            />
            <FeatureCard 
              icon="shield"
              title="Secure & Reliable"
              description="Enterprise-grade security with 99.9% uptime, ensuring your data and lessons are always safe and accessible."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Choose the plan that fits your teaching needs. All plans include a 14-day free trial.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={`text-sm font-medium ${selectedPlan === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setSelectedPlan(selectedPlan === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  selectedPlan === 'yearly' ? 'bg-[#6366F1]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    selectedPlan === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${selectedPlan === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
                <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </span>
            </div>
          </div>
          
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
             {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-[#6366F1] scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-500 ml-2">/{plan.period}</span>
                    </div>
                    {selectedPlan === 'yearly' && (
                      <p className="text-sm text-green-600 mt-1">Save 20% with yearly billing</p>
                    )}
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.name === "Enterprise" ? (
                    <Button 
                      className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5855EB] hover:to-[#7C3AED] text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  ) : (
                    <SignUpButton>
                      <Button 
                        className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5855EB] hover:to-[#7C3AED] text-white'
                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                        }`}
                      >
                        {plan.cta}
                      </Button>
                    </SignUpButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Loved by teachers worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how TeachAI is transforming English teaching for educators around the globe
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard 
              quote="TeachAI has completely transformed how I plan my lessons. The AI suggestions are incredibly relevant and save me hours each week."
              author="Sarah Johnson"
              role="ESL Teacher"
              location="London, UK"
              rating={5}
            />
            <TestimonialCard 
              quote="The progress tracking features are amazing. I can see exactly where each student needs help and tailor my teaching accordingly."
              author="Michael Chen"
              role="English Tutor"
              location="Toronto, Canada"
              rating={5}
            />
            <TestimonialCard 
              quote="Finally, a platform that understands what English teachers actually need. The automated communication with parents is a game-changer."
              author="Emma Rodriguez"
              role="Language School Director"
              location="Madrid, Spain"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to transform your teaching?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of teachers who are already using TeachAI to create better lessons, 
            track progress, and save time every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignUpButton>
              <Button size="lg" className="bg-white text-[#6366F1] hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl">
                Start Free Trial
              </Button>
            </SignUpButton>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#6366F1] px-8 py-4 text-lg font-semibold rounded-xl">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-xl font-bold">TeachAI</span>
              </div>
              <p className="text-gray-400">
                The intelligent teaching assistant for English educators worldwide.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TeachAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
     const getIcon = (iconName: string) => {
     const icons: Record<string, React.ReactElement> = {
      brain: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      chartLine: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      users: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      messageCircle: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      calendar: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      shield: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    };
    return icons[iconName] || icons.brain;
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      <div className="w-12 h-12 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {getIcon(icon)}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role, location, rating }: { 
  quote: string; 
  author: string; 
  role: string; 
  location: string; 
  rating: number; 
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
             <blockquote className="text-gray-700 mb-6 italic">&ldquo;{quote}&rdquo;</blockquote>
      <div>
        <div className="font-semibold text-gray-900">{author}</div>
        <div className="text-sm text-gray-500">{role} • {location}</div>
      </div>
    </div>
  );
} 