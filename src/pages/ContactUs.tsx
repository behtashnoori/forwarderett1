import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

const ContactUs = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "پیام ارسال شد",
      description: "به زودی با شما تماس خواهیم گرفت",
    });
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">تماس با ما</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            برای دریافت مشاوره رایگان و کسب اطلاعات بیشتر با ما در تماس باشید
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone size={24} />
                  اطلاعات تماس
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">تلفن تماس</h3>
                    <p className="text-muted-foreground ltr-input">۰۲۱-۸۸۸۸۸۸۸۸</p>
                    <p className="text-muted-foreground ltr-input">۰۹۱۲۳۴۵۶۷۸۹</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">ایمیل</h3>
                    <p className="text-muted-foreground ltr-input">info@forwarderett.ir</p>
                    <p className="text-muted-foreground ltr-input">sales@forwarderett.ir</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">آدرس</h3>
                    <p className="text-muted-foreground">
                      تهران، خیابان ولیعصر، نرسیده به میدان ونک، پلاک ۱۲۳، طبقه ۴
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Clock className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">ساعات کاری</h3>
                    <p className="text-muted-foreground">شنبه تا چهارشنبه: ۸:۰۰ تا ۱۷:۰۰</p>
                    <p className="text-muted-foreground">پنج‌شنبه: ۸:۰۰ تا ۱۳:۰۰</p>
                    <p className="text-muted-foreground">جمعه: تعطیل</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Services */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>خدمات سریع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-1">مشاوره رایگان</h4>
                    <p className="text-sm text-muted-foreground">۲۴ ساعته</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-1">پاسخ سریع</h4>
                    <p className="text-sm text-muted-foreground">کمتر از ۲ ساعت</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-1">پیگیری آنلاین</h4>
                    <p className="text-sm text-muted-foreground">۲۴/۷</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-1">تضمین کیفیت</h4>
                    <p className="text-sm text-muted-foreground">۱۰۰٪</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>فرم تماس</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">نام و نام خانوادگی *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="نام کامل خود را وارد کنید"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">شماره تماس *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      className="ltr-input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="example@email.com"
                    className="ltr-input"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">موضوع *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="موضوع درخواست خود را بنویسید"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">پیام *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="جزئیات درخواست خود را شرح دهید..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Send size={20} className="ml-2" />
                  ارسال پیام
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUs;