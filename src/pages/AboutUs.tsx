import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Users, 
  Award, 
  Globe, 
  Shield, 
  Clock, 
  CheckCircle,
  Target,
  Eye,
  Heart
} from "lucide-react";

const AboutUs = () => {
  const stats = [
    { icon: <Truck size={32} />, value: "۵۰۰+", label: "محموله موفق" },
    { icon: <Users size={32} />, value: "۲۰۰+", label: "مشتری راضی" },
    { icon: <Globe size={32} />, value: "۱۵+", label: "کشور مقصد" },
    { icon: <Award size={32} />, value: "۵+", label: "سال تجربه" }
  ];

  const services = [
    {
      icon: <Truck size={24} />,
      title: "حمل جاده‌ای",
      description: "حمل سریع و مطمئن در سراسر کشور با ناوگان مدرن"
    },
    {
      icon: <Globe size={24} />,
      title: "حمل بین‌المللی", 
      description: "ارسال به تمام نقاط جهان با بهترین نرخ‌ها"
    },
    {
      icon: <Shield size={24} />,
      title: "بیمه محموله",
      description: "بیمه کامل کالا در تمام مراحل حمل"
    },
    {
      icon: <Clock size={24} />,
      title: "پیگیری ۲۴/۷",
      description: "امکان پیگیری لحظه‌ای وضعیت محموله"
    }
  ];

  const values = [
    {
      icon: <Target size={24} />,
      title: "تعهد به کیفیت",
      description: "ارائه بالاترین کیفیت خدمات در تمام مراحل"
    },
    {
      icon: <Heart size={24} />,
      title: "رضایت مشتری",
      description: "مشتری محوری و پاسخگویی سریع به نیازها"
    },
    {
      icon: <CheckCircle size={24} />,
      title: "قابلیت اعتماد",
      description: "شفافیت و صداقت در تمام معاملات"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">درباره فورواردرت</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ما با تجربه چندین ساله در زمینه حمل و نقل و فورواردرت، 
            آماده ارائه بهترین خدمات لجستیک به شما هستیم
          </p>
        </div>

        {/* Company Story */}
        <Card className="mb-12 shadow-card">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">داستان ما</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  شرکت فورواردرت در سال ۱۳۹۸ با هدف ارائه خدمات نوین حمل و نقل و لجستیک آغاز به کار کرد. 
                  ما با تکیه بر تجربه تیم متخصص خود و استفاده از فناوری‌های روز دنیا، 
                  توانسته‌ایم جایگاه ویژه‌ای در صنعت حمل و نقل کشور پیدا کنیم.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  امروزه با شبکه گسترده‌ای از شرکای معتبر در سراسر جهان، 
                  خدمات جامع فورواردرت و حمل بین‌المللی را ارائه می‌دهیم.
                </p>
              </div>
              <div className="bg-gradient-card p-6 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-primary/10 p-3 rounded-full inline-block mb-2">
                        <div className="text-primary">{stat.icon}</div>
                      </div>
                      <div className="text-2xl font-bold persian-nums">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="text-primary" size={24} />
                ماموریت ما
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                ماموریت ما ارائه خدمات فورواردرت و حمل بین‌المللی با بالاترین کیفیت و کمترین هزینه است. 
                ما تلاش می‌کنیم تا با بهره‌گیری از فناوری‌های نوین و تیم متخصص، 
                تجربه‌ای بی‌نظیر از خدمات حمل و نقل را برای مشتریانمان فراهم کنیم.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="text-primary" size={24} />
                چشم‌انداز ما
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                چشم‌انداز ما تبدیل شدن به پیشرو در صنعت فورواردرت و حمل بین‌المللی در منطقه است. 
                ما در تلاشیم تا با گسترش شبکه خدماتمان و ارتقای مستمر کیفیت، 
                به انتخاب اول صادرکنندگان و واردکنندگان تبدیل شویم.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Services */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">خدمات ما</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth">
                <CardContent className="p-6 text-center">
                  <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                    <div className="text-primary">{service.icon}</div>
                  </div>
                  <h3 className="font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">ارزش‌های ما</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <div className="text-primary">{value.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-center">مجوزها و گواهینامه‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="px-4 py-2">
                مجوز فورواردرت از وزارت راه
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                عضو انجمن فورواردرهای ایران
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                گواهینامه ISO 9001
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                مجوز حمل بین‌المللی
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                عضو FIATA
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AboutUs;