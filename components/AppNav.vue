<template>
  <nav
    class="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-gray-700/80 dark:bg-gray-800/80"
  >
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-6">
        <NuxtLink
          to="/"
          class="flex items-center gap-2"
          aria-label="Početna"
        >
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500"
          >
            <UserGroupIcon class="h-5 w-5 text-white" />
          </div>
        </NuxtLink>
        <div class="hidden gap-1 sm:flex">
          <NavLink
            to="/"
            label="Početna"
            :icon="HomeIcon"
          />
          <NavLink
            to="/events"
            label="Događaji"
            :icon="CalendarIcon"
          />
          <NavLink
            to="/payments"
            label="Plaćanja"
            :icon="BanknotesIcon"
          />
          <NavLink
            to="/birthdays"
            label="Rođendani"
            :icon="CakeIcon"
          />
          <NavLink
            to="/expenses"
            label="Izdvajanja"
            :icon="ShoppingBagIcon"
          />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          aria-label="Odjavi se"
          @click="logout"
        >
          <ArrowRightOnRectangleIcon class="h-5 w-5" />
          <span class="ml-2 hidden sm:inline">Odjavi se</span>
        </Button>
      </div>
    </div>
    <!-- Mobile bottom nav with horizontal scroll -->
    <div
      class="scrollbar-hide flex w-full gap-1 overflow-x-auto border-t border-gray-200/80 px-4 py-2 dark:border-gray-700/80 sm:hidden"
    >
      <NavLink
        to="/"
        label="Početna"
        :icon="HomeIcon"
        class="shrink-0"
      />
      <NavLink
        to="/events"
        label="Događaji"
        :icon="CalendarIcon"
        class="shrink-0"
      />
      <NavLink
        to="/payments"
        label="Plaćanja"
        :icon="BanknotesIcon"
        class="shrink-0"
      />
      <NavLink
        to="/birthdays"
        label="Rođendani"
        :icon="CakeIcon"
        class="shrink-0"
      />
      <NavLink
        to="/expenses"
        label="Izdvajanja"
        :icon="ShoppingBagIcon"
        class="shrink-0"
      />
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  HomeIcon,
  CalendarIcon,
  BanknotesIcon,
  CakeIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline';
import { Button } from '~/components/ui/button';
import NavLink from '~/components/AppNavLink.vue';
import ThemeToggle from '~/components/ThemeToggle.vue';

const { logout } = useAuth();
</script>
