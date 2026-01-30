<template>
  <nav class="border-b border-gray-200 bg-white">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-6">
        <NuxtLink
          to="/"
          class="text-lg font-semibold text-gray-900"
        >
          Porodični asistent
        </NuxtLink>
        <div class="hidden gap-1 sm:flex">
          <NavLink
            to="/"
            label="Kontrolna tabla"
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
            label="Planirana izdvajanja"
            :icon="ShoppingBagIcon"
          />
        </div>
      </div>
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
    <!-- Mobile bottom nav -->
    <div class="flex justify-around border-t border-gray-200 py-2 sm:hidden">
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
} from '@heroicons/vue/24/outline';
import { Button } from '~/components/ui/button';
import NavLink from '~/components/AppNavLink.vue';

const { logout } = useAuth();
</script>
