import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";

import ConnectButton from "@/components/ConnectButton";

export default function Header() {
  return (
    <Navbar>
      <NavbarContent>
        <NavbarBrand>
          <p className="font-bold text-inherit">Flipside</p>
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
