<script setup lang="ts"></script>

<template>
  <!-- First Section: Upper Container -->

  <section class="w-[75%] h-[60%] border border-black bg-[var(--primary)]">
    <form action="" class="flex flex-col justify-between w-full h-full p-8">
      <!-- Row 1 -->

      <div
        class="w-full h-[75%] flex flex-col-reverse justify-between md:flex-row md:h-[82.5%]"
      >
        <!-- Row 1 Col 1: Input box -->

        <div
          class="border border-black w-full h-[35%] overflow-x-hidden md:w-[68.5%] md:h-full"
        >
          <input type="file" name="image-1" id="" accept="image" />
        </div>

        <!-- Row 1 Col 2: Header, Input box -->

        <div
          class="w-full h-[60%] flex flex-col justify-between md:w-[28.5%] md:h-full"
        >
          <!-- Col 2 Row 1 -->

          <div class="w-full md:h-[45%] md:overflow-scroll">
            <h1 class="pb-8 font-semibold">SnapSense</h1>
            <p class="hidden md:block">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. A
              dignissimos ducimus nemo magnam fugiat rem? Repellat ipsam neque
              id laboriosam assumenda. Nihil cumque saepe, voluptas illum
              consectetur deserunt quos quas!
            </p>
          </div>

          <!-- Col 2 Row 2 -->

          <div
            class="border border-black w-full h-[90%] overflow-hidden md:h-[50%]"
          >
            <input type="file" name="image-2" id="" accept="image" />
          </div>
        </div>
      </div>

      <!-- Row 2: Select and Button -->

      <div
        class="w-full h-[20%] flex flex-col justify-between md:h-[12.5%] md:flex-row"
      >
        <select
          name="platform"
          id=""
          class="border border-black w-full h-[45%] px-4 md:w-[53%] md:h-full md:px-8"
        >
          <option value="" disabled selected>What's this for?</option>
        </select>

        <button class="border border-black w-full h-[45%] md:w-[45%] md:h-full">
          Let's get you a caption
        </button>
      </div>
    </form>
  </section>
  <hr class="w-[75%] border-black" />

  <!-- Section 2: Lower Container -->

  <section
    class="w-[75%] h-[20%] border border-black p-8 flex bg-[var(--primary)]"
  >
    <div class="w-[80%] md:w-[90%]"></div>
    <div class="w-[20%] flex items-end justify-evenly md:w-[10%]">
      <button>like</button>
      <button>share</button>
    </div>
  </section>
</template>
