import { Link } from "react-router-dom";
import { Star, Shield, Truck, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import heroBanner from "@/assets/B2.jpg";
// import heroBanner from "@/assets/banner.png";
import BgImg from "@/assets/bg.png";

const Home = () => {
  const featuredProducts = products
    .filter((product) => product.featured)
    .slice(0, 6);
  const { addToCart } = useCart();

  const features = [
    {
      icon: Shield,
      title: "Handcrafted Quality",
      description:
        "Premium handcrafted Poshak made with traditional techniques",
    },
    {
      icon: Star,
      title: "Divine Collection",
      description: "Authentic designs blessed for Krishna and Radha worship",
    },
    {
      icon: Truck,
      title: "Free Shipping",
      description: "Free delivery on all orders above ₹2,500 across India",
    },
    {
      icon: RefreshCw,
      title: "30-Day Returns",
      description: "Full money-back guarantee if you're not satisfied",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          {/* <div className="absolute inset-0 bg-black/0"></div> */}
        </div>

        {/* <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto mt-24">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Divine Poshak for <br />
            <span className="text-primary">Krishna & Radha</span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
              >
                Shop Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-black hover:bg-white hover:text-foreground px-8 py-3 text-lg"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div> */}

      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Collection
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our most cherished Poshak and accessories, handpicked for their
              divine beauty and craftsmanship
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredProducts.map((product, index) => (
              <Card key={index} className="product-card group cursor-pointer">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/products">
              <Button
                variant="outline"
                size="lg"
                className="px-8 bg-primary text-white"
              >
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-8">
          <hr />
        </div>
      </section>

      {/* Why Choose Us */}

      <section className="pb-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Kunj Creation?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're dedicated to providing authentic, handcrafted Poshak with
              traditional values
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className="text-center p-6 hover:shadow-lg transition-shadow relative overflow-hidden" // Added relative & overflow-hidden
                >
                  {/* Background Image Overlay */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-20 transition-opacity duration-300 rounded-lg" // Adjust opacity and other styles as needed
                    style={{ backgroundImage: `url(${BgImg})` }}
                  ></div>

                  <CardContent className="pt-6 relative z-10">
                    {" "}
                    {/* Added relative z-10 for content to be above image */}
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-16 bg-[#445E47] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Bring Divine Beauty Home?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of devotees who trust Kunj Creation for their sacred wardrobe needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg bg-primary">
                Shop Now
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-primary hover:bg-white hover:text-primary px-8 py-3 text-lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Home;
