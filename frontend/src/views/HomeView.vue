<template>
  <div class="relative min-h-screen">
    <!-- Hero Section -->
    <div class="relative h-screen flex items-center justify-center overflow-hidden">
      <!-- Background Image with Blur -->
      <div 
        class="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 transform hover:scale-105"
        style="background-image: url('/images/chengdu/hero-chengdu.jpg'); filter: blur(2px) brightness(0.85);"
      ></div>
      
      <!-- Overlay Gradient -->
      <div class="absolute inset-0 z-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>

      <!-- Content -->
      <div class="relative z-10 text-center px-4 max-w-5xl mx-auto" data-aos="fade-up">
        <h1 class="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-200 drop-shadow-lg font-montserrat">
          成都旅游服务平台
        </h1>
        <p class="text-xl md:text-2xl text-gray-100 mb-10 font-light tracking-wide drop-shadow-md">
          一年成聚，二年成邑，三年成都
        </p>
        
        <div class="flex flex-col sm:flex-row justify-center gap-6">
          <router-link to="/attractions">
            <button class="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto">
              <el-icon><Compass /></el-icon> 探索景点
            </button>
          </router-link>
          
          <router-link to="/routes">
            <button class="px-8 py-4 bg-white/20 backdrop-blur-md border-2 border-white/50 text-white text-lg font-bold rounded-full shadow-xl hover:bg-white/30 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto">
              <el-icon><MapLocation /></el-icon> 规划路线
            </button>
          </router-link>
        </div>
      </div>
      
      <!-- Scroll Down Indicator -->
      <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/80 cursor-pointer" @click="scrollToCarousel">
        <el-icon class="text-4xl"><ArrowDown /></el-icon>
      </div>
    </div>

    <!-- Carousel Section -->
    <div id="carousel-section" class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-800 flex items-center justify-center gap-3">
          <el-icon class="text-green-600"><Camera /></el-icon> 热门景点概览
        </h2>
        
        <el-carousel :interval="4000" type="card" height="400px" class="shadow-2xl rounded-xl overflow-hidden">
          <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
            <div class="relative w-full h-full group cursor-pointer">
              <img :src="item.image" :alt="item.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 transition-opacity duration-300">
                <div class="absolute bottom-0 left-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 class="text-2xl font-bold mb-2">{{ item.title }}</h3>
                  <p class="text-sm text-gray-200 line-clamp-2">{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Compass, MapLocation, ArrowDown, Camera } from '@element-plus/icons-vue'

const carouselItems = [
  {
    title: '成都大熊猫繁育研究基地',
    desc: '全球最大的大熊猫迁地保护基地，清晨可见熊猫进食攀爬。',
    image: '/images/chengdu/panda-base.jpg'
  },
  {
    title: '宽窄巷子',
    desc: '三条清代老街并排而立，茶馆、川剧与手作市集交错。',
    image: '/images/chengdu/kuanzhai.jpg'
  },
  {
    title: '都江堰',
    desc: '两千余年仍在灌溉成都平原的无坝引水工程，世界水利奇迹。',
    image: '/images/chengdu/dujiangyan.jpg'
  },
  {
    title: '锦里古街',
    desc: '夜幕降临红灯次第亮起，被称为成都版清明上河图。',
    image: '/images/chengdu/jinli.jpg'
  }
]

const scrollToCarousel = () => {
  document.getElementById('carousel-section')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.font-montserrat {
  font-family: 'Montserrat', 'Arial Rounded MT Bold', sans-serif;
}
</style>