import { Check, Clock, Phone } from "lucide-react";

const ProcessStepper = () => {
  const steps = [
    {
      icon: <Check size={20} />,
      title: "ثبت درخواست",
      description: "تکمیل فرم مشخصات بار",
      status: "active"
    },
    {
      icon: <Phone size={20} />,
      title: "تماس کارشناس",
      description: "تا ۲ ساعت آینده",
      status: "pending"
    },
    {
      icon: <Clock size={20} />,
      title: "تخصیص فورواردر",
      description: "اعلام نتیجه و قیمت",
      status: "pending"
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-6 right-6 left-6 h-0.5 bg-muted">
          <div className="h-full w-1/3 bg-gradient-primary rounded-full"></div>
        </div>

        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center relative z-10">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-smooth ${
                step.status === "active"
                  ? "bg-gradient-primary text-white shadow-glow"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.icon}
            </div>
            <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
            <p className="text-xs text-muted-foreground max-w-24">{step.description}</p>
          </div>
        ))}
      </div>

      {/* SLA Badge */}
      <div className="flex justify-center mt-6">
        <div className="bg-warning/10 text-warning px-4 py-2 rounded-full text-sm font-medium">
          SLA: ۲ ساعت
        </div>
      </div>
    </div>
  );
};

export default ProcessStepper;