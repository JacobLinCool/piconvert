import { execSync } from "child_process";
import { check_inkscape } from "../utils";

/**
 * Install Inkscape
 *
 * On Linux, this will use `apt` to install Inkscape.
 *
 * On macOS, this will use `brew` to install Inkscape.
 *
 * On Windows, this will use `choco` to install Inkscape.
 *
 * @param verbose Print execution output?
 * @returns True if Inkscape was installed, false otherwise
 */
export async function install_inkscape(verbose = false): Promise<boolean> {
    if (check_inkscape()) {
        return true;
    } else {
        const sudo = process.getuid && process.getuid() === 0 ? "sudo " : "";

        let command = "";
        if (process.platform === "linux") {
            command = `${sudo}add-apt-repository -y ppa:inkscape.dev/stable && ${sudo}apt update && ${sudo}apt install -y inkscape`;
        } else if (process.platform === "darwin") {
            command = "brew install --cask inkscape";
        } else if (process.platform === "win32") {
            command = "choco install inkscape";
        } else {
            command = "echo 'Please download from https://inkscape.org/release/ and install manually.'";
        }

        execSync(command, { stdio: verbose ? "inherit" : "ignore" });
    }
    return check_inkscape();
}
