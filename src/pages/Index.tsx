import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Stethoscope, Trophy, Database, Bot, GraduationCap, Zap, CheckCircle } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary-gradient text-primary-foreground py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            HealthEcho Game
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto">
            Challenge AI in Medical Ultrasound Analysis
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          
          {/* How It Works Section */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold mb-8 text-foreground">How It Works</h2>
            <div className="space-y-8">
              {steps.map((step) => {
                const IconComponent = step.icon;
                return (
                  <div key={step.number} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shadow-red">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Game Features Section */}
          <div className="lg:col-span-1">
            <Card className="bg-accent text-accent-foreground shadow-elegant border-0">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-8 text-center">Game Features</h2>
                <div className="space-y-6">
                  {features.map((feature) => {
                    const IconComponent = feature.icon;
                    return (
                      <div key={feature.title} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 mt-1">
                          <CheckCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <IconComponent className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold">{feature.title}</h3>
                          </div>
                          <p className="text-sm opacity-90">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="lg:col-span-1">
            <div className="text-center space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">
                  Ready to Challenge the AI?
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Put your medical knowledge to the test and see if you can outperform our AI.
                </p>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-red hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Start Quiz vs AI
                </Button>
              </div>
              
              <div className="pt-8 border-t border-border">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium">Data Mining</p>
                  <p>Johannes Gutenberg University</p>
                  <p>Mainz, Germany</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Index;