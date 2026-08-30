import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Car,
  HeartPulse,
  Plane,
  Users,
  Stethoscope,
  Truck,
  Zap,
  Tag,
  ShieldCheck,
  CalendarCheck,
  Folder,
  CreditCard,
  Star,
  ArrowLeft,
  Clock,
  Phone,
  Shield,
  Award,
  Users2,
  Building2,
  TrendingDown,
} from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import {
  insuranceTypes,
  insuranceCompanies,
  testimonials,
  features,
} from "@/lib/insurance-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  car: Car,
  "heart-pulse": HeartPulse,
  plane: Plane,
  users: Users,
  stethoscope: Stethoscope,
  truck: Truck,
  zap: Zap,
  tag: Tag,
  "shield-check": ShieldCheck,
  "calendar-check": CalendarCheck,
  folder: Folder,
  "credit-card": CreditCard,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "بيكير — مقارنة تأمين السيارات في السعودية" },
      {
        name: "description",
        content:
          "المنصة الأذكى لمقارنة عروض تأمين السيارات من أكثر من 20 شركة تأمين. احصل على عرض سعر فوري وإصدار فوري.",
      },
      { property: "og:title", content: "بيكير — مقارنة تأمين السيارات" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[600px] pt-16 md:pt-20">
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/10999980/pexels-photo-10999980.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600"
              alt="طريق في الصحراء"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-primary-950/95 via-primary-900/85 to-primary-800/70" />
          </div>

          <div className="container-x relative z-10 py-16 md:py-24">
            <div className="mx-auto max-w-3xl space-y-6 animate-slide-up text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <Zap className="h-4 w-4 text-accent-400" />
                المنصة الأذكى لمقارنة تأمين السيارات
              </div>
              <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl text-balance">
                اشتر تأمين ضد الغير / شامل في
                <span className="block bg-gradient-to-l from-accent-400 to-secondary-400 bg-clip-text text-transparent">
                  دقائق
                </span>
              </h1>
              <p className="mx-auto max-w-xl text-lg leading-relaxed text-primary-100">
                المنصة الأذكى لمقارنة عروض أكثر من 20 شركة تأمين. احصل على أرخص تأمين سيارات مع
                إصدار فوري وربط مباشر بنجم.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/insurance/$type" params={{ type: "car" }} className="btn-accent">
                  ابدأ الآن
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-6 pt-4">
                {[
                  { icon: Zap, text: "إصدار فوري" },
                  { icon: TrendingDown, text: "أسعار أقل" },
                  { icon: Shield, text: "معتمد من هيئة التأمين" },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-2 text-sm text-primary-100"
                  >
                    <item.icon className="h-5 w-5 text-accent-400" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-b border-dark-100 bg-white">
          <div className="container-x">
            <div className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
              {[
                { icon: Building2, value: "+20", label: "شركة تأمين" },
                { icon: Users2, value: "+500K", label: "عميل سعيد" },
                { icon: Award, value: "+1M", label: "وثيقة مصدرة" },
                { icon: Star, value: "4.8", label: "تقييم العملاء" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-dark-900">{stat.value}</div>
                    <div className="text-sm text-dark-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Insurance Types */}
        <section className="section-padding bg-dark-50">
          <div className="container-x">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-extrabold text-dark-900 md:text-4xl">منتجاتنا</h2>
              <p className="mt-3 text-lg text-dark-500">أنواع تأمين متعددة تناسب احتياجاتك</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {insuranceTypes.map((type) => {
                const Icon = iconMap[type.icon] || Car;
                return (
                  <Link
                    key={type.id}
                    to="/insurance/$type"
                    params={{ type: type.id }}
                    className="group card hover:scale-[1.02]"
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${type.bgColor} ${type.color} transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-dark-900">{type.name}</h3>
                    <p className="mt-2 text-sm text-dark-500">{type.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary-600">
                      اعرف المزيد
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="section-padding bg-white">
          <div className="container-x">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-extrabold text-dark-900 md:text-4xl">
                ليش بيكير خيارك الأول في التأمين؟
              </h2>
              <p className="mt-3 text-lg text-dark-500">
                عندنا فريق يراقب كل صغيرة وكبيرة في السوق ويضمن أن سعرك الأقل
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = iconMap[feature.icon] || Zap;
                return (
                  <div
                    key={feature.title}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-50 to-white p-6 ring-1 ring-dark-200/60 transition-all hover:shadow-xl"
                  >
                    <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary-100/50 transition-transform group-hover:scale-150" />
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/30">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-dark-900">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-dark-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Partners / Insurance Companies */}
        <section className="section-padding bg-dark-50">
          <div className="container-x">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-extrabold text-dark-900 md:text-4xl">
                شركاؤنا من شركات التأمين
              </h2>
              <p className="mt-3 text-lg text-dark-500">نقارن لك عروض أكثر من 20 شركة تأمين</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {insuranceCompanies.map((company) => (
                <div
                  key={company.id}
                  className="group flex h-24 items-center justify-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-dark-200/60 transition-all hover:shadow-lg hover:scale-105"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold"
                      style={{ backgroundColor: company.color }}
                    >
                      {company.name.charAt(0)}
                    </div>
                    <span className="text-center text-xs font-medium text-dark-700">
                      {company.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="section-padding bg-white">
          <div className="container-x">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-extrabold text-dark-900 md:text-4xl">كيف تعمل بيكير؟</h2>
              <p className="mt-3 text-lg text-dark-500">ثلاث خطوات بسيطة للحصول على تأمينك</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                { num: "1", title: "أدخل بياناتك", desc: "أدخل بيانات مركبتك أو احتياجك التأميني" },
                {
                  num: "2",
                  title: "قارن العروض",
                  desc: "قارن عروض أكثر من 20 شركة تأمين بشكل فوري",
                },
                { num: "3", title: "اشتر وتمتع", desc: "اختر العرض المناسب وتمتع بإصدار فوري" },
              ].map((step, idx) => (
                <div key={step.num} className="relative text-center">
                  {idx < 2 && (
                    <div className="absolute top-12 right-0 hidden h-0.5 w-full bg-gradient-to-l from-primary-300 to-transparent md:block" />
                  )}
                  <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-3xl font-extrabold text-white shadow-xl shadow-primary-600/30">
                    {step.num}
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-dark-900">{step.title}</h3>
                  <p className="mt-2 text-dark-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Special Offer Banner */}
        <section className="section-padding bg-dark-50">
          <div className="container-x">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-primary-700 via-primary-800 to-primary-950 p-8 md:p-12">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl" />
              <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-secondary-500/20 blur-3xl" />
              <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
                <div className="text-center md:text-right">
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent-500/20 px-4 py-2 text-sm font-semibold text-accent-300">
                    <Clock className="h-4 w-4" />
                    سارع قبل نهاية العرض!
                  </div>
                  <h2 className="mt-4 text-3xl font-extrabold text-white md:text-4xl">
                    خصومات حتى <span className="text-accent-400">30%</span>
                  </h2>
                  <p className="mt-3 max-w-lg text-primary-100">
                    خصومات لبعض القطاعات الحكومية وشبه الحكومية والخاصة. عروض تفهمك وتضبطك.
                  </p>
                </div>
                <Link to="/insurance/$type" params={{ type: "car" }} className="btn-accent whitespace-nowrap">
                  احصل على خصمك الآن
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-padding bg-white">
          <div className="container-x">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-extrabold text-dark-900 md:text-4xl">ماذا يقول عملاؤنا</h2>
              <p className="mt-3 text-lg text-dark-500">آراء حقيقية من عملاء سعداء</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.name} className="card">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < t.rating ? "fill-accent-400 text-accent-400" : "text-dark-300"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-dark-600">{t.text}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-dark-900">{t.name}</div>
                      <div className="text-sm text-dark-500">{t.city}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gradient-to-b from-dark-50 to-white">
          <div className="container-x">
            <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-center md:p-16">
              <Shield className="mx-auto h-16 w-16 text-white/80" />
              <h2 className="mt-6 text-3xl font-extrabold text-white md:text-4xl">
                طريقك آمـن مع بيكير
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
                تأمينك في دقيقة. نقارن لك كل عروض الأسعار بشكل فوري من كل شركات التأمين.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/insurance/$type" params={{ type: "car" }} className="btn-accent">
                  ابدأ المقارنة الآن
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <a
                  href="tel:920000000"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <Phone className="h-5 w-5" />
                  920000000
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
