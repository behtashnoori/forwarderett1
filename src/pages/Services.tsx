import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Plane, 
  Ship, 
  Train,
  Shield,
  FileText,
  Package,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Snowflake,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  const transportModes = [
    {
      icon: <Truck size={32} />,
      title: "حمل جاده‌ای",
      description: "حمل سریع و مطمئن در سراسر کشور",
      features: [
        "پوشش تمام نقاط کشور",
        "ناوگان مدرن و متنوع", 
        "تحویل درب به درب",
        "امکان حمل بارهای حجیم"
      ],
      timeframe: "۱-۳ روز کاری",
      suitable: "بارهای عمومی، مواد غذایی، لوازم خانگی"
    },
    {
      icon: <Plane size={32} />,
      title: "حمل هوایی",
      description: "سریع‌ترین روش حمل برای بارهای فوری",
      features: [
        "حمل سریع بین‌المللی",
        "مناسب بارهای گران‌قیمت",
        "پیگیری لحظه‌ای",
        "امنیت بالا"
      ],
      timeframe: "۱-۷ روز",
      suitable: "الکترونیک، دارو، مواد فوری"
    },
    {
      icon: <Ship size={32} />,
      title: "حمل دریایی",
      description: "اقتصادی‌ترین روش برای بارهای حجیم",
      features: [
        "کمترین هزینه حمل",
        "مناسب بارهای سنگین",
        "حمل کانتینری",
        "پوشش جهانی"
      ],
      timeframe: "۱۵-۴۵ روز",
      suitable: "مواد خام، ماشین‌آلات، کالاهای عمومی"
    },
    {
      icon: <Train size={32} />,
      title: "حمل ریلی",
      description: "ترکیب سرعت و اقتصادی بودن",
      features: [
        "صرفه‌جویی در هزینه",
        "احترام به محیط زیست",
        "مناسب مسافت‌های طولانی",
        "ظرفیت بالا"
      ],
      timeframe: "۵-۱۵ روز",
      suitable: "مواد خام، کشاورزی، صنعتی"
    }
  ];

  const additionalServices = [
    {
      icon: <FileText size={24} />,
      title: "تشریفات گمرکی",
      description: "انجام کلیه امور گمرکی و ترخیص کالا"
    },
    {
      icon: <Shield size={24} />,
      title: "بیمه محموله",
      description: "بیمه کامل کالا در برابر خسارات احتمالی"
    },
    {
      icon: <Package size={24} />,
      title: "بسته‌بندی و انبارداری",
      description: "خدمات بسته‌بندی حرفه‌ای و انبارداری"
    },
    {
      icon: <MapPin size={24} />,
      title: "پیگیری مرسوله",
      description: "پیگیری آنلاین و به‌روزرسانی مستمر وضعیت"
    },
    {
      icon: <DollarSign size={24} />,
      title: "مشاوره نرخ",
      description: "ارائه بهترین نرخ‌ها و مشاوره اقتصادی"
    },
    {
      icon: <Clock size={24} />,
      title: "خدمات اکسپرس",
      description: "حمل فوری برای بارهای ضروری"
    }
  ];

  const specialServices = [
    {
      icon: <AlertTriangle size={24} />,
      title: "حمل مواد خطرناک",
      description: "حمل ایمن مواد شیمیایی و خطرناک با مجوزهای لازم",
      badge: "تخصصی"
    },
    {
      icon: <Snowflake size={24} />,
      title: "حمل یخچالی",
      description: "حمل مواد غذایی و دارویی با کنترل دما",
      badge: "کنترل دما"
    },
    {
      icon: <Package size={24} />,
      title: "پروژه‌های بزرگ",
      description: "حمل ماشین‌آلات سنگین و تجهیزات صنعتی",
      badge: "سنگین"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">خدمات ما</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            مجموعه کاملی از خدمات حمل و نقل و فورواردرت برای تمام نیازهای شما
          </p>
        </div>

        {/* Transport Modes */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">روش‌های حمل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {transportModes.map((mode, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <div className="text-primary">{mode.icon}</div>
                    </div>
                    <div>
                      <CardTitle>{mode.title}</CardTitle>
                      <p className="text-muted-foreground">{mode.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">ویژگی‌ها:</h4>
                    <ul className="space-y-1">
                      {mode.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle size={16} className="text-success" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">مدت زمان:</span>
                      <Badge variant="outline">{mode.timeframe}</Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">مناسب برای:</span>
                      <p className="text-sm text-muted-foreground mt-1">{mode.suitable}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Services */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">خدمات جانبی</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalServices.map((service, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <div className="text-primary">{service.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{service.title}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Special Services */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">خدمات تخصصی</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialServices.map((service, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-warning/10 p-3 rounded-full">
                      <div className="text-warning">{service.icon}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{service.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {service.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Process Steps */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">فرایند همکاری</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "۱", title: "درخواست", desc: "ثبت درخواست آنلاین" },
              { step: "۲", title: "مشاوره", desc: "تماس کارشناس و قیمت‌گذاری" },
              { step: "۳", title: "اجرا", desc: "شروع عملیات حمل" },
              { step: "۴", title: "تحویل", desc: "تحویل ایمن به مقصد" }
            ].map((process, index) => (
              <Card key={index} className="shadow-card text-center">
                <CardContent className="p-6">
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold persian-nums">
                    {process.step}
                  </div>
                  <h3 className="font-semibold mb-2">{process.title}</h3>
                  <p className="text-sm text-muted-foreground">{process.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-hero text-white shadow-elegant">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">آماده شروع همکاری هستید؟</h2>
            <p className="mb-6 opacity-90">
              همین الان درخواست حمل خود را ثبت کنید و از خدمات حرفه‌ای ما بهره‌مند شوید
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/">
                  <Package className="ml-2" size={20} />
                  ثبت درخواست حمل
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/contact">
                  <ArrowRight className="ml-2" size={20} />
                  تماس با ما
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Services;