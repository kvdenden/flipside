import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";

import ConnectButton from "@/components/ConnectButton";
import Link from "next/link";

export default function Header() {
  return (
    <Navbar maxWidth="xl">
      <NavbarContent>
        <NavbarBrand>
          <p className="font-bold text-inherit">
            <Link href="/">Flipside</Link>
          </p>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <ConnectButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
