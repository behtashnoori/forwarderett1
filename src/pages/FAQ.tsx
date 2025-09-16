import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Phone, HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      category: "عمومی",
      questions: [
        {
          q: "فورواردرت چیست و چه خدماتی ارائه می‌دهد؟",
          a: "فورواردرت شرکتی است که خدمات حمل و نقل بین‌المللی، تشریفات گمرکی، بیمه محموله و انبارداری را ارائه می‌دهد. ما به عنوان واسطه بین فرستنده و گیرنده کالا، تمام مراحل حمل را هماهنگ می‌کنیم."
        },
        {
          q: "چه مدارکی برای ثبت درخواست حمل نیاز است؟",
          a: "برای ثبت درخواست فقط به اطلاعات پایه کالا، آدرس مبدأ و مقصد، اطلاعات تماس و مشخصات بار نیاز دارید. مدارک تکمیلی در صورت لزوم توسط کارشناس ما درخواست خواهد شد."
        },
        {
          q: "چگونه می‌توانم وضعیت محموله خود را پیگیری کنم؟",
          a: "پس از ثبت درخواست، شماره پیگیری دریافت خواهید کرد. می‌توانید با همین شماره در قسمت پیگیری سایت، وضعیت محموله خود را به‌روزرسانی کنید."
        }
      ]
    },
    {
      category: "قیمت‌گذاری",
      questions: [
        {
          q: "قیمت حمل بر چه اساسی محاسبه می‌شود؟",
          a: "قیمت حمل بر اساس عواملی چون نوع کالا، وزن، حجم، مسافت، نوع حمل (جاده‌ای، هوایی، دریایی)، خدمات اضافی و شرایط بازار محاسبه می‌شود."
        },
        {
          q: "آیا امکان مذاکره روی قیمت وجود دارد؟",
          a: "بله، برای محموله‌های حجیم و مشتریان دائمی امکان تخفیف و مذاکره روی قیمت وجود دارد. با کارشناسان ما تماس بگیرید."
        },
        {
          q: "چه زمانی باید هزینه حمل را پرداخت کنم؟",
          a: "هزینه حمل معمولاً پیش از شروع حمل پرداخت می‌شود. برای مشتریان دائمی امکان پرداخت اعتباری نیز وجود دارد."
        }
      ]
    },
    {
      category: "زمان‌بندی",
      questions: [
        {
          q: "مدت زمان حمل معمولاً چقدر است؟",
          a: "مدت زمان حمل بستگی به روش حمل دارد: جاده‌ای ۱-۳ روز، هوایی ۱-۷ روز، دریایی ۱۵-۴۵ روز و ریلی ۵-۱۵ روز. زمان دقیق پس از بررسی مسیر اعلام می‌شود."
        },
        {
          q: "آیا امکان حمل فوری وجود دارد؟",
          a: "بله، برای بارهای فوری خدمات اکسپرس ارائه می‌دهیم که در کمترین زمان ممکن محموله را به مقصد می‌رساند."
        },
        {
          q: "چرا گاهی حمل بیشتر از زمان اعلام شده طول می‌کشد؟",
          a: "تأخیر ممکن است به دلایلی چون شرایط آب و هوایی، مشکلات گمرکی، ترافیک یا مسائل فنی رخ دهد. در چنین مواردی فوراً با شما تماس گرفته و وضعیت اطلاع‌رسانی می‌شود."
        }
      ]
    },
    {
      category: "بیمه و امنیت",
      questions: [
        {
          q: "آیا محموله من بیمه می‌شود؟",
          a: "بله، تمام محموله‌ها در برابر خسارات احتمالی در طول مسیر بیمه می‌شوند. جزئیات پوشش بیمه در قرارداد ذکر شده است."
        },
        {
          q: "در صورت آسیب یا گم شدن کالا چه اتفاقی می‌افتد؟",
          a: "در صورت بروز هرگونه خسارت، فوراً موضوع به شرکت بیمه اعلام شده و فرآیند جبران خسارت آغاز می‌شود. مدارک لازم از مشتری دریافت خواهد شد."
        },
        {
          q: "چگونه از امنیت محموله اطمینان حاصل کنم؟",
          a: "ما با شرکای معتبر و دارای مجوز همکاری می‌کنیم. تمام محموله‌ها دارای کد پیگیری هستند و در طول مسیر تحت نظارت قرار دارند."
        }
      ]
    },
    {
      category: "مدارک و گمرک",
      questions: [
        {
          q: "چه مدارکی برای حمل بین‌المللی نیاز است؟",
          a: "برای حمل بین‌المللی به مدارکی چون فاکتور، لیست بسته‌بندی، مجوز صادرات/واردات، گواهی مبدأ و سایر مدارک مربوط به نوع کالا نیاز است."
        },
        {
          q: "آیا امور گمرکی را انجام می‌دهید؟",
          a: "بله، تیم متخصص ما تمام امور گمرکی شامل ترخیص کالا، پرداخت عوارض و مجوزهای لازم را انجام می‌دهد."
        },
        {
          q: "مدت زمان ترخیص کالا از گمرک چقدر است؟",
          a: "مدت زمان ترخیص بستگی به نوع کالا و پیچیدگی مدارک دارد. معمولاً ۱ تا ۵ روز کاری طول می‌کشد."
        }
      ]
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">سوالات متداول</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            پاسخ سوالات رایج درباره خدمات فورواردرت و حمل بین‌المللی
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="max-w-4xl mx-auto space-y-8">
          {faqs.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="shadow-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-primary">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                      <AccordionTrigger className="text-right">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-12 bg-gradient-card shadow-elegant">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                <HelpCircle className="text-primary" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">سوال خود را پیدا نکردید؟</h2>
              <p className="text-muted-foreground">
                تیم پشتیبانی ما آماده پاسخگویی به سوالات شما است
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/contact">
                  <MessageCircle className="ml-2" size={20} />
                  فرم تماس
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="tel:02188888888">
                  <Phone className="ml-2" size={20} />
                  تماس تلفنی
                </a>
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">پشتیبانی ۲۴/۷</h4>
                  <p className="text-muted-foreground">همیشه در دسترس</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">مشاوره رایگان</h4>
                  <p className="text-muted-foreground">بدون هیچ هزینه‌ای</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">پاسخ سریع</h4>
                  <p className="text-muted-foreground">کمتر از ۲ ساعت</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FAQ;