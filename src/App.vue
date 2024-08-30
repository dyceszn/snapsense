<script setup lang="ts"></script>

<template>
  <section
    class="w-[75%] h-[60%] border border-black p-8 flex flex-col justify-between bg-[var(--primary)]"
  >
    <!-- Row 1 -->
    <div class="w-full h-[82.5%] flex justify-between">
      <!-- Col 1 -->
      <div class="border border-black w-[68.5%] h-full">
        <input type="file" name="image-1" id="" accept="image" />
      </div>
      <!-- Col 2 -->
      <div class="w-[28.5%] h-full flex flex-col justify-between">
        <div class="w-full h-[45%]">
          <h1 class="pb-8 font-semibold">SnapSense</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A
            dignissimos ducimus nemo magnam fugiat rem? Repellat ipsam neque id
            laboriosam assumenda. Nihil cumque saepe, voluptas illum consectetur
            deserunt quos quas!
          </p>
        </div>
        <div class="border border-black w-full h-[50%]">
          <input type="file" name="image-2" id="" accept="image" />
        </div>
      </div>
    </div>
    <!-- Row 2 -->
    <div class="w-full h-[12.5%] flex justify-between">
      <select name="platform" id="" class="border border-black w-[53%] h-full">
        <option value="" disabled selected>What's this for?</option>
      </select>
      <button class="border border-black w-[45%] h-full">
        Let's get you a caption
      </button>
    </div>
  </section>
  <hr class="w-[75%] border-black" />
  <section
    class="w-[75%] h-[20%] border border-black p-8 flex bg-[var(--primary)]"
  >
    <div class="w-[90%]"></div>
    <div class="w-[10%] flex items-end justify-evenly">
      <button>like</button>
      <button>share</button>
    </div>
  </section>
</template>
