<template>
  <div class="relative min-h-screen">
    <!-- Hero Section -->
    <div class="relative h-screen flex items-center justify-center overflow-hidden">
      <!-- Background Image with Blur -->
      <div 
        class="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 transform hover:scale-105"
        style="background-image: url('https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'); filter: blur(2px) brightness(0.85);"
      ></div>
      
      <!-- Overlay Gradient -->
      <div class="absolute inset-0 z-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>

      <!-- Content -->
      <div class="relative z-10 text-center px-4 max-w-5xl mx-auto" data-aos="fade-up">
        <h1 class="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-200 drop-shadow-lg font-montserrat">
          黄山旅游服务平台
        </h1>
        <p class="text-xl md:text-2xl text-gray-100 mb-10 font-light tracking-wide drop-shadow-md">
          五岳归来不看山，黄山归来不看岳
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
    title: '迎客松',
    desc: '黄山标志性景观，姿态优美，枝干遒劲，仿佛在张开双臂迎接远道而来的客人。',
    image: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    title: '光明顶',
    desc: '黄山第二高峰，日出云海的最佳观赏点之一，视野开阔，气象万千。',
    image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    title: '莲花峰',
    desc: '黄山最高峰，峻峭高耸，气势雄伟，登顶可一览众山小。',
    image: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    title: '西海大峡谷',
    desc: '梦幻般的峡谷风光，云雾缭绕，奇峰林立，是黄山最神秘深邃的区域。',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
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