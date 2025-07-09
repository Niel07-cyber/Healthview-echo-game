import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Stethoscope, Trophy, Database, Bot, GraduationCap, Zap } from "lucide-react";
import doctorVsAi from "@/assets/doctor-vs-ai.jpg";

const Index = () => {
  const steps = [
    {
      number: 1,
      title: "Analyze Videos",
      description: "View echocardiogram videos and analyze cardiac function",
      icon: Video,
    },
    {
      number: 2,
      title: "Make Diagnosis", 
      description: "Answer questions about cardiac conditions based on ultrasound data",
      icon: Stethoscope,
    },
    {
      number: 3,
      title: "Beat the AI",
      description: "Compare your diagnostic accuracy against our trained AI model",
      icon: Trophy,
    },
  ];

  const features = [
    {
      title: "Real Medical Data",
      description: "Authentic echocardiogram videos from clinical practice",
      icon: Database,
    },
    {
      title: "AI Competition", 
      description: "Challenge ML models trained on thousands of cases",
      icon: Bot,
    },
    {
      title: "Educational Value",
      description: "Learn from mistakes and improve diagnostic skills", 
      icon: GraduationCap,
    },
    {
      title: "Instant Feedback",
      description: "Get immediate results and explanations",
      icon: Zap,
    },
  ];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Compact Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4 shadow-elegant">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">HealthEcho Game</h1>
          <p className="text-sm opacity-90">Challenge AI in Medical Ultrasound Analysis</p>
        </div>
      </header>

      {/* Main Content - Single Screen Layout */}
      <main className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-h-full pb-16">
        
        {/* How It Works - Left Column */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">How It Works</h2>
          <div className="space-y-3">
            {steps.map((step) => {
              const IconComponent = step.icon;
              return (
                <Card key={step.number} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {step.number}
                    </div>
                    <IconComponent className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Game Features - Center Column */}
        <div className="lg:col-span-4">
          <Card className="bg-accent text-accent-foreground h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-center">Game Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg bg-background/10">
                    <div className="w-6 h-6 text-primary flex-shrink-0 mt-0.5">
                      <IconComponent className="w-full h-full" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs opacity-90 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* CTA Section - Right Column */}
        <div className="lg:col-span-4">
          <Card className="text-center p-6 shadow-elegant h-full flex flex-col justify-center">
            <div className="space-y-6">
              {/* Doctor vs AI Image */}
              <div className="mb-4">
                <img 
                  src={doctorVsAi} 
                  alt="Doctor challenging AI" 
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3 text-foreground">
                  Ready to Challenge the AI?
                </h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Put your medical knowledge to the test and see if you can outperform our AI.
                </p>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 font-semibold shadow-red hover:shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => window.location.href = '/quiz'}
                >
                  Start Quiz vs AI
                </Button>
              </div>
            </div>
          </Card>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-muted border-t py-3 px-4">
        <div className="container mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            Data Mining • Johannes Gutenberg University • Mainz, Germany
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;